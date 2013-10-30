package org.opencb.variant.lib.runners;

import org.opencb.commons.bioformats.variant.vcf4.VariantEffect;
import org.opencb.commons.bioformats.variant.vcf4.VcfRecord;
import org.opencb.commons.bioformats.variant.vcf4.effect.EffectCalculator;
import org.opencb.commons.bioformats.variant.vcf4.io.readers.VariantDataReader;
import org.opencb.commons.bioformats.variant.vcf4.io.writers.effect.VariantEffectDataWriter;

import java.io.IOException;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: aaleman
 * Date: 10/24/13
 * Time: 2:16 PM
 * To change this template use File | Settings | File Templates.
 */
public class VariantEffectRunner extends VariantRunner {
    public VariantEffectRunner(VariantDataReader reader, VariantEffectDataWriter writer) {
        super(reader, writer);
    }

    public VariantEffectRunner(VariantDataReader reader, VariantEffectDataWriter writer, VariantRunner prev) {
        super(reader, writer, prev);
    }

    @Override
    public List<VcfRecord> apply(List<VcfRecord> batch) throws IOException {

        if (writer != null) {
            List<VariantEffect> batchEffect = EffectCalculator.getEffects(batch);
            ((VariantEffectDataWriter) writer).writeVariantEffect(batchEffect);
        }

        return batch;
    }

}
