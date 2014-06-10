package org.opencb.variant.lib.runners.tasks;

import org.opencb.commons.bioformats.variant.Variant;
import org.opencb.commons.bioformats.variant.annotators.VariantAnnotator;
import org.opencb.commons.run.Task;

import java.io.IOException;
import java.util.List;

/**
 * @author Alejandro Aleman Ramos <aaleman@cipf.es>
 */
public class VariantAnnotTask extends Task<Variant> {

    private List<VariantAnnotator> annotations;

    public VariantAnnotTask(List<VariantAnnotator> annots) {
        super();
        this.annotations = annots;
    }

    public VariantAnnotTask(List<VariantAnnotator> annots, int priority) {
        super(priority);
        this.annotations = annots;
    }

    @Override
    public boolean apply(List<Variant> batch) throws IOException {

        for (VariantAnnotator annotation : annotations) {
            annotation.annot(batch);
        }

        return true;
    }
}
