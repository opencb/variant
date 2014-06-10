package org.opencb.variant.lib.runners.tasks;

import org.opencb.commons.bioformats.variant.Variant;
import org.opencb.commons.bioformats.variant.VariantSource;
import org.opencb.commons.bioformats.variant.stats.StatsCalculator;
import org.opencb.commons.bioformats.variant.utils.stats.VariantGlobalStats;
import org.opencb.commons.bioformats.variant.utils.stats.VariantStats;
import org.opencb.commons.bioformats.variant.utils.stats.VariantStatsWrapper;
import org.opencb.commons.bioformats.variant.vcf4.io.readers.VariantReader;
import org.opencb.commons.run.Task;

import java.io.IOException;
import java.util.Iterator;
import java.util.List;

/**
 * @author Alejandro Aleman Ramos <aaleman@cipf.es>
 */
public class VariantStatsTask extends Task<Variant> {

    private VariantReader reader;
    private VariantSource study;
    private VariantStatsWrapper stats;

    public VariantStatsTask(VariantReader reader, VariantSource study) {
        super();
        this.reader = reader;
        this.study = study;
        stats = new VariantStatsWrapper();

    }

    public VariantStatsTask(VariantReader reader, VariantSource study, int priority) {
        super(priority);
        this.reader = reader;
        this.study = study;
        stats = new VariantStatsWrapper();

    }

    @Override
    public boolean apply(List<Variant> batch) throws IOException {

        stats.setSampleNames(reader.getSampleNames());
        stats.setVariantStats(StatsCalculator.variantStats(batch, reader.getSampleNames(), study.getPedigree()));
        stats.addGlobalStats(StatsCalculator.globalStats(stats.getVariantStats()));
        stats.addSampleStats(StatsCalculator.sampleStats(batch, reader.getSampleNames(), study.getPedigree()));

        if (study.getPedigree() != null) {
            stats.addGroupStats("phenotype", StatsCalculator.groupStats(batch, study.getPedigree(), "phenotype"));
            stats.addGroupStats("family", StatsCalculator.groupStats(batch, study.getPedigree(), "family"));
            stats.addSampleGroupStats("phenotype", StatsCalculator.sampleGroupStats(batch, study.getPedigree(), "phenotype"));
            stats.addSampleGroupStats("family", StatsCalculator.sampleGroupStats(batch, study.getPedigree(), "family"));
        }

        Iterator<Variant> variantIterator = batch.iterator();
        Iterator<VariantStats> statsIterator = stats.getVariantStats().iterator();

        while (variantIterator.hasNext() && statsIterator.hasNext()) {
            variantIterator.next().setStats(statsIterator.next());
        }


        return true;
    }

    @Override
    public boolean post() {

        VariantGlobalStats finalGlobalStats = stats.getFinalGlobalStats();

        study.setStats(finalGlobalStats);

        return true;

    }
}
