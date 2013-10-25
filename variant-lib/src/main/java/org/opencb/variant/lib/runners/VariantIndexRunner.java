package org.opencb.variant.lib.runners;

import org.opencb.commons.bioformats.variant.vcf4.VcfRecord;
import org.opencb.commons.bioformats.variant.vcf4.io.readers.VariantDataReader;
import org.opencb.commons.bioformats.variant.vcf4.io.writers.index.VariantIndexDataWriter;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: aaleman
 * Date: 9/2/13
 * Time: 6:09 PM
 * To change this template use File | Settings | File Templates.
 */
public class VariantIndexRunner extends VariantRunner {


    public VariantIndexRunner(VariantDataReader reader, VariantIndexDataWriter writer) {
        super(reader, writer);
    }

    public VariantIndexRunner(VariantDataReader reader, VariantIndexDataWriter writer, VariantRunner prev) {
        super(reader, writer, prev);
    }

    @Override
    public List<VcfRecord> apply(List<VcfRecord> batch) {
        if (writer != null)
            ((VariantIndexDataWriter) writer).writeVariantIndex(batch);
        return batch;
    }

    @Override
    public void pre() {
    }

    @Override
    public void post() {
    }

}
