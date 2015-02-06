package org.opencb.variant.lib.runners.tasks;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.opencb.biodata.models.variant.Variant;
import org.opencb.biodata.models.variant.effect.VariantEffect;
import org.opencb.biodata.tools.variant.EffectCalculator;
import org.opencb.commons.run.Task;

/**
 * @author Alejandro Aleman Ramos <aaleman@cipf.es>
 * @author Cristina Yenyxe Gonzalez Garcia <cyenyxe@ebi.ac.uk>
 */
public class VariantEffectTask extends Task<Variant> {

    public VariantEffectTask() {
    }

    public VariantEffectTask(int priority) {
        super(priority);
    }

    @Override
    public boolean apply(List<Variant> batch) throws IOException {
        Map<Variant, Set<VariantEffect>> effects = EffectCalculator.getEffects(batch);

        for (Map.Entry<Variant, Set<VariantEffect>> effectsPerVariant : effects.entrySet()) {
            for (VariantEffect effect : effectsPerVariant.getValue()) {
                effectsPerVariant.getKey().addEffect(effect.getAlternateAllele(), effect);
            }
        }

        return true;
    }
}
