package org.opencb.variant.lib.runners;

import org.opencb.commons.bioformats.pedigree.io.readers.PedDataReader;
import org.opencb.commons.bioformats.variant.VariantStudy;
import org.opencb.commons.bioformats.variant.vcf4.VcfRecord;
import org.opencb.commons.bioformats.variant.vcf4.io.readers.VariantDataReader;
import org.opencb.commons.bioformats.variant.vcf4.io.writers.stats.VariantStatsDataWriter;
import org.opencb.commons.bioformats.variant.vcf4.stats.CalculateStats;
import org.opencb.commons.bioformats.variant.vcf4.stats.VcfGlobalStat;
import org.opencb.commons.bioformats.variant.vcf4.stats.VcfStats;

import java.io.IOException;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: aaleman
 * Date: 9/2/13
 * Time: 6:09 PM
 * To change this template use File | Settings | File Templates.
 */
public class VariantStatsRunner extends VariantRunner {

    private VcfStats stats;


    public VariantStatsRunner(VariantStudy study, VariantDataReader reader, PedDataReader pedReader, VariantStatsDataWriter writer) {
        super(study, reader, pedReader, writer);

        stats = new VcfStats();
    }

    public VariantStatsRunner(VariantStudy study, VariantDataReader reader, PedDataReader pedReader, VariantStatsDataWriter writer, VariantRunner prev) {
        super(study, reader, pedReader, writer, prev);
        stats = new VcfStats();

    }

    // TODO aaleman: Override the "pre" (write file stats)

    @Override
    public List<VcfRecord> apply(List<VcfRecord> batch) throws IOException {

        stats.setSampleNames(reader.getSampleNames());
        stats.setVariantStats(CalculateStats.variantStats(batch, reader.getSampleNames(), study.getPedigree()));
        stats.addGlobalStats(CalculateStats.globalStats(stats.getVariantStats()));
        stats.addSampleStats(CalculateStats.sampleStats(batch, reader.getSampleNames(), study.getPedigree()));

        if (study.getPedigree() != null) {
            stats.addGroupStats("phenotype", CalculateStats.groupStats(batch, study.getPedigree(), "phenotype"));
            stats.addGroupStats("family", CalculateStats.groupStats(batch, study.getPedigree(), "family"));
            stats.addSampleGroupStats("phenotype", CalculateStats.sampleGroupStats(batch, study.getPedigree(), "phenotype"));
            stats.addSampleGroupStats("family", CalculateStats.sampleGroupStats(batch, study.getPedigree(), "family"));
        }

        if (writer != null) {
            VariantStatsDataWriter customWriter = (VariantStatsDataWriter) writer;
            customWriter.writeVariantStats(stats.getVariantStats());
            customWriter.writeVariantGroupStats(stats.getGroupStats("phenotype"));
            customWriter.writeVariantGroupStats(stats.getGroupStats("family"));
        }

        return batch;
    }

    @Override
    public void post() throws IOException {

        VcfGlobalStat finalGlobalStats = stats.getFinalGlobalStats();

        study.setStats(finalGlobalStats);

        if (writer != null) {
            VariantStatsDataWriter customWriter = (VariantStatsDataWriter) writer;
            customWriter.writeGlobalStats(finalGlobalStats);
            customWriter.writeSampleStats(stats.getFinalSampleStats());

            customWriter.writeSampleGroupStats(stats.getFinalSampleGroupStat("phenotype"));
            customWriter.writeSampleGroupStats(stats.getFinalSampleGroupStat("family"));
        }
    }

}
