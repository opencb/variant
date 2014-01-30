package org.opencb.variant.lib.runners;

import org.opencb.commons.bioformats.pedigree.io.readers.PedDataReader;
import org.opencb.commons.bioformats.variant.VariantStudy;
import org.opencb.commons.bioformats.variant.vcf4.VcfRecord;
import org.opencb.commons.bioformats.variant.vcf4.io.readers.VariantReader;
import org.opencb.commons.bioformats.variant.vcf4.io.writers.VariantWriter;
import org.opencb.commons.io.DataWriter;
import org.opencb.commons.run.Runner;
import org.opencb.commons.run.Task;

import java.io.IOException;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: aaleman
 * Date: 10/24/13
 * Time: 11:50 AM
 * To change this template use File | Settings | File Templates.
 */
public class VariantRunner extends Runner<VcfRecord> {

    protected VariantStudy study;

    public VariantRunner(VariantStudy study, VariantReader reader, PedDataReader pedReader, List<VariantWriter> writer, List<Task<VcfRecord>> tasks) {
        super(reader, writer, tasks);
        this.study = study;
        parsePhenotypes(pedReader);
    }

    private void parsePhenotypes(PedDataReader pedReader) {
        if (pedReader != null) {
            pedReader.open();
            study.setPedigree(pedReader.read());
            pedReader.close();
        }
    }

    public VariantStudy getStudy() {
        return study;
    }

    public void setStudy(VariantStudy study) {
        this.study = study;
    }

    protected void readerInit() {
        super.readerInit();
        study.addMetadata("variant_file_header", ((VariantReader) reader).getHeader());
        study.setSamples(((VariantReader) reader).getSampleNames());
    }

}
