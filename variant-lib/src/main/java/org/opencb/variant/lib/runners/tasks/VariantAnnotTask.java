package org.opencb.variant.lib.runners.tasks;

import org.opencb.commons.bioformats.variant.Variant;
import org.opencb.commons.bioformats.variant.vcf4.VcfRecord;
import org.opencb.commons.bioformats.variant.vcf4.annotators.VcfAnnotator;
import org.opencb.commons.run.Task;

import java.io.IOException;
import java.util.List;

/**
 * @author Alejandro Aleman Ramos <aaleman@cipf.es>
 */
public class VariantAnnotTask extends Task<Variant> {

    private List<VcfAnnotator> annotations;

    public VariantAnnotTask(List<VcfAnnotator> annots) {
        super();
        this.annotations = annots;
    }

    public VariantAnnotTask(List<VcfAnnotator> annots, int priority) {
        super(priority);
        this.annotations = annots;
    }

    @Override
    public boolean apply(List<Variant> batch) throws IOException {

        for (VcfAnnotator annotation : annotations) {
            annotation.annot(batch);
        }

        return true;
    }
}
