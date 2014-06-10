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
 */
public class VariantEffectTask extends Task<Variant> {

    public VariantEffectTask() {
    }

    public VariantEffectTask(int priority) {
        super(priority);
    }

    @Override
    public boolean apply(List<Variant> batch) throws IOException {
        List<List<VariantEffect>> batchEffect = EffectCalculator.getEffectPerVariant(batch);

        Iterator<Variant> variantIterator = batch.iterator();
        Iterator<List<VariantEffect>> effectIterator = batchEffect.iterator();

        while (variantIterator.hasNext() && effectIterator.hasNext()) {
            variantIterator.next().setEffect(effectIterator.next());
        }

        return true;
    }
}
