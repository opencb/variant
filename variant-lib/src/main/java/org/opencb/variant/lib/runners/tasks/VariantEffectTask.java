package org.opencb.variant.lib.runners.tasks;

import java.io.IOException;
import java.util.Iterator;
import java.util.List;
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
        List<VariantEffect> batchEffect = EffectCalculator.getEffects(batch);

        Iterator<Variant> variantIterator = batch.iterator();
        Iterator<VariantEffect> effectIterator = batchEffect.iterator();

        while (variantIterator.hasNext() && effectIterator.hasNext()) {
            VariantEffect effect = effectIterator.next();
            
            if (effect != null) { // TODO Could it be that the return effect was null instead of empty?
                variantIterator.next().setEffect(effect);
            }
        }

        return true;
    }
}
