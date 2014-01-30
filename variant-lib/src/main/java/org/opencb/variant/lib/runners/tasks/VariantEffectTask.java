package org.opencb.variant.lib.runners.tasks;

import org.opencb.commons.bioformats.variant.utils.effect.VariantEffect;
import org.opencb.commons.bioformats.variant.vcf4.VcfRecord;
import org.opencb.commons.bioformats.variant.vcf4.effect.EffectCalculator;
import org.opencb.commons.run.Task;

import java.io.IOException;
import java.util.List;

/**
 * @author Alejandro Aleman Ramos <aaleman@cipf.es>
 */
public class VariantEffectTask extends Task<VcfRecord> {

    private List<VariantEffect> batchEffect;

    public VariantEffectTask() {
    }

    public VariantEffectTask(int priority) {
        super(priority);
    }

    @Override
    public boolean apply(List<VcfRecord> batch) throws IOException {

        batchEffect = EffectCalculator.getEffects(batch);
        System.out.println(batchEffect.get(0));
        return true;
    }
}
