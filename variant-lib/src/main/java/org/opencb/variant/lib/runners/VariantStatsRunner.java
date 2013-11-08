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
import org.opencb.commons.bioformats.variant.VariantStudy;

/**
 * Created with IntelliJ IDEA.
 * User: aaleman
 * Date: 9/2/13
 * Time: 6:09 PM
 * To change this template use File | Settings | File Templates.
 */
public class VariantStatsRunner extends VariantRunner {

    private List<VcfGlobalStat> globalStats;
    private List<VcfSampleStat> sampleStats;
    private List<VcfSampleGroupStat> sampleGroupPhen;
    private List<VcfSampleGroupStat> sampleGroupFam;


    public VariantStatsRunner(VariantStudy study, VariantDataReader reader, PedDataReader pedReader, VariantStatsDataWriter writer) {
        super(study, reader, pedReader, writer);
        globalStats = new ArrayList<>(100);
        sampleStats = new ArrayList<>(100);
        sampleGroupPhen = new ArrayList<>(100);
        sampleGroupFam = new ArrayList<>(100);
    }

    public VariantStatsRunner(VariantStudy study, VariantDataReader reader, PedDataReader pedReader, VariantStatsDataWriter writer, VariantRunner prev) {
        super(study, reader, pedReader, writer, prev);
        globalStats = new ArrayList<>(100);
        sampleStats = new ArrayList<>(100);
        sampleGroupPhen = new ArrayList<>(100);
        sampleGroupFam = new ArrayList<>(100);
    }

    // TODO aaleman: Override the "pre" (write file stats)

    @Override
    public List<VcfRecord> apply(List<VcfRecord> batch) throws IOException {
        VcfGlobalStat globalStat;
        VcfSampleStat vcfSampleStat;

        List<VcfVariantStat> statsList;
        
        VcfSampleGroupStat vcfSampleGroupStatPhen;
        VcfSampleGroupStat vcfSampleGroupStatFam;

        VcfVariantGroupStat groupStatsBatchPhen = null;
        VcfVariantGroupStat groupStatsBatchFam = null;


        statsList = CalculateStats.variantStats(batch, reader.getSampleNames(), study.getPedigree());
        globalStat = CalculateStats.globalStats(statsList);
        globalStats.add(globalStat);

        vcfSampleStat = CalculateStats.sampleStats(batch, reader.getSampleNames(), study.getPedigree());
        sampleStats.add(vcfSampleStat);

        if (study.getPedigree() != null) {
            groupStatsBatchPhen = CalculateStats.groupStats(batch, study.getPedigree(), "phenotype");
            groupStatsBatchFam = CalculateStats.groupStats(batch, study.getPedigree(), "family");

            vcfSampleGroupStatPhen = CalculateStats.sampleGroupStats(batch, study.getPedigree(), "phenotype");
            sampleGroupPhen.add(vcfSampleGroupStatPhen);

            vcfSampleGroupStatFam = CalculateStats.sampleGroupStats(batch, study.getPedigree(), "family");
            sampleGroupFam.add(vcfSampleGroupStatFam);
        }

        if (writer != null) {
            VariantStatsDataWriter customWriter = (VariantStatsDataWriter) writer;
            customWriter.writeVariantStats(statsList);
            customWriter.writeVariantGroupStats(groupStatsBatchPhen);
            customWriter.writeVariantGroupStats(groupStatsBatchFam);
        }

        return batch;
    }

    @Override
    public void post() throws IOException {

        VcfGlobalStat globalStat = new VcfGlobalStat(globalStats);
        VcfSampleStat vcfSampleStat = new VcfSampleStat(reader.getSampleNames(), sampleStats);
        VcfSampleGroupStat vcfSampleGroupStatPhen = new VcfSampleGroupStat(sampleGroupPhen);
        VcfSampleGroupStat vcfSampleGroupStatFam = new VcfSampleGroupStat(sampleGroupFam);
        
        study.setStats(globalStat);
        
        if (writer != null) {
            VariantStatsDataWriter customWriter = (VariantStatsDataWriter) writer;
            customWriter.writeGlobalStats(globalStat);
            customWriter.writeSampleStats(vcfSampleStat);

            customWriter.writeSampleGroupStats(vcfSampleGroupStatFam);
            customWriter.writeSampleGroupStats(vcfSampleGroupStatPhen);
        }
    }

}
