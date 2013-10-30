package org.opencb.variant.lib.runners;

import org.opencb.commons.bioformats.pedigree.Pedigree;
import org.opencb.commons.bioformats.pedigree.io.readers.PedDataReader;
import org.opencb.commons.bioformats.pedigree.io.readers.PedFileDataReader;
import org.opencb.commons.bioformats.variant.vcf4.VcfRecord;
import org.opencb.commons.bioformats.variant.vcf4.io.readers.VariantDataReader;
import org.opencb.commons.bioformats.variant.vcf4.io.writers.stats.VariantStatsDataWriter;
import org.opencb.commons.bioformats.variant.vcf4.stats.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: aaleman
 * Date: 9/2/13
 * Time: 6:09 PM
 * To change this template use File | Settings | File Templates.
 */
public class VariantStatsRunner extends VariantRunner {

    private String pedFile;
    private List<VcfGlobalStat> globalStats;
    private List<VcfSampleStat> sampleStats;
    private List<VcfSampleGroupStat> sampleGroupPhen;
    private List<VcfSampleGroupStat> sampleGroupFam;


    public VariantStatsRunner(VariantDataReader reader, VariantStatsDataWriter writer, String pedFile) {
        super(reader, writer);
        this.pedFile = pedFile;
        globalStats = new ArrayList<>(100);
        sampleStats = new ArrayList<>(100);
        sampleGroupPhen = new ArrayList<>(100);
        sampleGroupFam = new ArrayList<>(100);
    }

    public VariantStatsRunner(VariantDataReader reader, VariantStatsDataWriter writer, String pedFile, VariantRunner prev) {
        super(reader, writer, prev);
        this.pedFile = pedFile;
        globalStats = new ArrayList<>(100);
        sampleStats = new ArrayList<>(100);
        sampleGroupPhen = new ArrayList<>(100);
        sampleGroupFam = new ArrayList<>(100);
    }

    // TODO aaleman: Override the "pre" (write file stats)

    @Override
    public List<VcfRecord> apply(List<VcfRecord> batch) throws IOException {

        VariantStatsDataWriter customWriter = (VariantStatsDataWriter) writer;
        Pedigree ped = null;
        PedDataReader pedReader = null;

        if (pedFile != null) {
            pedReader = new PedFileDataReader(pedFile);
        }

        VcfGlobalStat globalStat;
        VcfSampleStat vcfSampleStat;

        List<VcfVariantStat> statsList;

        if (pedReader != null) {
            pedReader.open();
            ped = pedReader.read();
            pedReader.close();
        }

        VcfSampleGroupStat vcfSampleGroupStatPhen;
        VcfSampleGroupStat vcfSampleGroupStatFam;


        VcfVariantGroupStat groupStatsBatchPhen = null;
        VcfVariantGroupStat groupStatsBatchFam = null;


        statsList = CalculateStats.variantStats(batch, reader.getSampleNames(), ped);
        globalStat = CalculateStats.globalStats(statsList);
        globalStats.add(globalStat);

        vcfSampleStat = CalculateStats.sampleStats(batch, reader.getSampleNames(), ped);
        sampleStats.add(vcfSampleStat);

        if (ped != null) {
            groupStatsBatchPhen = CalculateStats.groupStats(batch, ped, "phenotype");
            groupStatsBatchFam = CalculateStats.groupStats(batch, ped, "family");

            vcfSampleGroupStatPhen = CalculateStats.sampleGroupStats(batch, ped, "phenotype");
            sampleGroupPhen.add(vcfSampleGroupStatPhen);

            vcfSampleGroupStatFam = CalculateStats.sampleGroupStats(batch, ped, "family");
            sampleGroupFam.add(vcfSampleGroupStatFam);
        }

        customWriter.writeVariantStats(statsList);
        customWriter.writeVariantGroupStats(groupStatsBatchPhen);
        customWriter.writeVariantGroupStats(groupStatsBatchFam);

        return batch;
    }

    @Override
    public void post() throws IOException {
        VariantStatsDataWriter customWriter = (VariantStatsDataWriter) writer;

        VcfGlobalStat globalStat = new VcfGlobalStat(globalStats);
        VcfSampleStat vcfSampleStat = new VcfSampleStat(reader.getSampleNames(), sampleStats);
        VcfSampleGroupStat vcfSampleGroupStatPhen = new VcfSampleGroupStat(sampleGroupPhen);
        VcfSampleGroupStat vcfSampleGroupStatFam = new VcfSampleGroupStat(sampleGroupFam);

        customWriter.writeGlobalStats(globalStat);
        customWriter.writeSampleStats(vcfSampleStat);

        customWriter.writeSampleGroupStats(vcfSampleGroupStatFam);
        customWriter.writeSampleGroupStats(vcfSampleGroupStatPhen);

    }

}
