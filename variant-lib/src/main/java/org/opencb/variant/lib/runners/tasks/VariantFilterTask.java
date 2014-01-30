package org.opencb.variant.lib.runners.tasks;

import org.opencb.commons.bioformats.variant.Variant;
import org.opencb.commons.bioformats.variant.vcf4.annotators.VcfAnnotator;
import org.opencb.commons.bioformats.variant.vcf4.filters.VcfFilter;
import org.opencb.commons.filters.FilterApplicator;
import org.opencb.commons.run.Task;

import java.io.IOException;
import java.util.List;

/**
 * @author Alejandro Aleman Ramos <aaleman@cipf.es>
 */
public class VariantFilterTask extends Task<Variant> {
    private List<VcfFilter> filters;

    public VariantFilterTask(List<VcfFilter> filters) {
        super();
        this.filters = filters;
    }

    public VariantFilterTask(List<VcfFilter> filters, int priority) {
        super(priority);
        this.filters = filters;
    }

    @Override
    public boolean apply(List<Variant> batch) throws IOException {

        FilterApplicator.filter(batch, filters);

        return true;
    }
}
