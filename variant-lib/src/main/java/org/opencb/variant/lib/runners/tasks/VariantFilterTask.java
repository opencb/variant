package org.opencb.variant.lib.runners.tasks;

import org.opencb.commons.filters.FilterApplicator;
import org.opencb.commons.run.Task;

import java.io.IOException;
import java.util.List;
import org.opencb.biodata.models.variant.Variant;
import org.opencb.commons.bioformats.variant.filters.VariantFilter;

/**
 * @author Alejandro Aleman Ramos <aaleman@cipf.es>
 */
public class VariantFilterTask extends Task<Variant> {
    private List<VariantFilter> filters;

    public VariantFilterTask(List<VariantFilter> filters) {
        super();
        this.filters = filters;
    }

    public VariantFilterTask(List<VariantFilter> filters, int priority) {
        super(priority);
        this.filters = filters;
    }

    @Override
    public boolean apply(List<Variant> batch) throws IOException {

        FilterApplicator.filter(batch, filters);

        return true;
    }
}
