package org.opencb.variant.lib.runners;

import org.opencb.commons.bioformats.pedigree.io.readers.PedigreeReader;
import org.opencb.commons.bioformats.variant.Variant;
import org.opencb.commons.bioformats.variant.VariantStudy;
import org.opencb.commons.bioformats.variant.vcf4.io.readers.VariantReader;
import org.opencb.commons.bioformats.variant.vcf4.io.writers.VariantWriter;
import org.opencb.commons.run.Runner;
import org.opencb.commons.run.Task;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: aaleman
 * Date: 10/24/13
 * Time: 11:50 AM
 * To change this template use File | Settings | File Templates.
 */
public class VariantRunner extends Runner<Variant> {

    protected VariantStudy study;

    public VariantRunner(VariantStudy study, VariantReader reader, PedigreeReader pedReader, List<VariantWriter> writer, List<Task<Variant>> tasks) {
        super(reader, writer, tasks);
        this.study = study;
        parsePhenotypes(pedReader);
    }

    private void parsePhenotypes(PedigreeReader pedReader) {
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
