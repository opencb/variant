package org.opencb.variant.lib.runners;

import java.io.IOException;
import org.opencb.commons.bioformats.variant.vcf4.VcfRecord;
import org.opencb.commons.bioformats.variant.vcf4.io.readers.VariantDataReader;
import org.opencb.commons.bioformats.variant.vcf4.io.writers.index.VariantDataWriter;

import java.util.List;
import org.opencb.commons.bioformats.pedigree.io.readers.PedDataReader;
import org.opencb.commons.bioformats.variant.VariantStudy;
import org.opencb.commons.bioformats.variant.vcf4.io.VariantDBWriter;

/**
 * Created with IntelliJ IDEA.
 * User: aaleman
 * Date: 9/2/13
 * Time: 6:09 PM
 * To change this template use File | Settings | File Templates.
 */
public class VariantIndexRunner extends VariantRunner {


    public VariantIndexRunner(VariantStudy study, VariantDataReader reader, PedDataReader pedReader, VariantDataWriter writer) {
        super(study, reader, pedReader, writer);
    }

    public VariantIndexRunner(VariantStudy study, VariantDataReader reader, PedDataReader pedReader, VariantDataWriter writer, VariantRunner prev) {
        super(study, reader, pedReader, writer, prev);
    }

    @Override
    public List<VcfRecord> apply(List<VcfRecord> batch) {
        if (writer != null) {
            ((VariantDataWriter) writer).writeBatch(batch);
        }
        return batch;
    }

    @Override
    public void post() throws IOException {
        if (writer instanceof VariantDBWriter) {
            ((VariantDBWriter) writer).writeStudy(study);
        }
    }
    
    
}
