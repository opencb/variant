package org.opencb.variant.lib.io.variant.annotators;

import net.sf.samtools.util.StringUtil;
import org.broad.tribble.readers.TabixReader;
import org.opencb.variant.lib.core.formats.VcfRecord;
import org.opencb.variant.lib.core.formats.VcfVariantStat;
import org.opencb.variant.lib.stats.CalculateStats;

import java.io.IOException;
import java.util.*;

/**
 * Created with IntelliJ IDEA.
 * User: aleman
 * Date: 9/14/13
 * Time: 1:11 PM
 * To change this template use File | Settings | File Templates.
 */
public class VcfControlAnnotator implements VcfAnnotator {

    private TabixReader tabix;
    private String tabixFile;
    private List<String> samples;
    private HashMap<String, Integer> samplesMap;
    private HashMap<String, TabixReader> controlList;
    private String prefix;

    public VcfControlAnnotator(String infoPrefix, String control) throws IOException {

        this.prefix = infoPrefix;
        this.tabixFile = control;
        this.tabix = new TabixReader(this.tabixFile);

        String line;
        while ((line = tabix.readLine()) != null && !line.startsWith("#CHROM")) {
        }

        String[] fields = line.split("\t");

        samples = new ArrayList<>(fields.length - 9);
        samplesMap = new LinkedHashMap<>(fields.length - 9);
        for (int i = 9, j = 0; i < fields.length; i++, j++) {
            samples.add(fields[i]);
            samplesMap.put(fields[i], j);

        }

        this.tabix.close();

    }

    public VcfControlAnnotator(String infoPrefix, HashMap<String, String> controlList) {

        this.prefix = infoPrefix;
        this.controlList = new LinkedHashMap<>(controlList.size());

        boolean b = true;
        TabixReader t;

        try {
            for (Map.Entry<String, String> entry : controlList.entrySet()) {

                t = new TabixReader(entry.getValue());
                this.controlList.put(entry.getKey(), t);

                if (b) {
                    b = false;

                    String line;
                    while ((line = t.readLine()) != null && !line.startsWith("#CHROM")) {
                    }

                    String[] fields = line.split("\t");

                    samples = new ArrayList<>(fields.length - 9);
                    samplesMap = new LinkedHashMap<>(fields.length - 9);
                    for (int i = 9, j = 0; i < fields.length; i++, j++) {
                        samples.add(fields[i]);
                        samplesMap.put(fields[i], j);

                    }
                }
                t.close();
            }

        } catch (IOException e) {
            e.printStackTrace();
        }

    }

    @Override
    public void annot(List<VcfRecord> batch) {

        VcfRecord tabixRecord;

        TabixReader currentTabix;

        List<VcfRecord> controlBatch = new ArrayList<>(batch.size());
        List<VcfVariantStat> statsBatch;
        HashMap<VcfRecord, Integer> map = new LinkedHashMap<>(batch.size());

        try {
            this.tabix = new TabixReader(this.tabixFile);

            int cont = 0;

            currentTabix = new TabixReader(this.tabixFile);

            for (VcfRecord record : batch) {

                /*if (this.tabix == null && controlList != null) {
                    currentTabix = controlList.get(record.getChromosome());
                } else {
                    currentTabix = new TabixReader(this.tabixFile);
                }*/

                if (currentTabix != null) {


                    try {

                        TabixReader.Iterator it = currentTabix.query(record.getChromosome() + ":" + record.getPosition() + "-" + record.getPosition());

                        String line = it.next();
                        while (it != null && line != null) {

                            String[] fields = line.split("\t");
                            tabixRecord = new VcfRecord(fields);

                            if (tabixRecord.getReference().equals(record.getReference()) && tabixRecord.getAlternate().equals(record.getAlternate())) {

                                tabixRecord.setSampleIndex(this.samplesMap);
                                controlBatch.add(tabixRecord);
                                map.put(record, cont++);
                            }
                            line = it.next();
                        }
                    }
                    catch (IOException e) {
                        System.err.println("record = " + record);

                        e.printStackTrace();
                    } catch (ArrayIndexOutOfBoundsException e) { // If the Chr does not exist in Controls... TabixReader throws ArrayIndexOut...
                        continue;
                    }
                }
            }
            currentTabix.close();
        } catch (IOException e) {
            e.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
        }




        statsBatch = CalculateStats.variantStats(controlBatch, this.samples, null);

        VcfVariantStat statRecord;

        for (VcfRecord record : batch) {

            if (map.containsKey(record)) {
                statRecord = statsBatch.get(map.get(record));
                record.addInfoField(this.prefix + "_gt=" + StringUtil.join(",", statRecord.getGenotypes()));
                record.addInfoField(this.prefix + "_maf=" + String.format("%.3f", statRecord.getMaf()));
                record.addInfoField(this.prefix + "_amaf=" + statRecord.getMafAllele());
            }
        }
    }

    @Override
    public void annot(VcfRecord elem) {
        //To change body of implemented methods use File | Settings | File Templates.
    }
}
