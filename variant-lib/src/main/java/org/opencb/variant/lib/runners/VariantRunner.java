package org.opencb.variant.lib.runners;

import java.util.List;
import org.opencb.commons.bioformats.pedigree.io.readers.PedDataReader;
import org.opencb.commons.bioformats.variant.Variant;
import org.opencb.commons.bioformats.variant.VariantStudy;
import org.opencb.commons.bioformats.variant.vcf4.io.readers.VariantReader;
import org.opencb.commons.bioformats.variant.vcf4.io.writers.VariantWriter;
import org.opencb.commons.run.Runner;
import org.opencb.commons.run.Task;

/**
 * @author Alejandro Aleman Ramos <aaleman@cipf.es>
 * @author Cristina Yenyxe Gonzalez Garcia <cgonzalez@cipf.es>
 */
public class VariantRunner extends Runner<Variant> {

    protected VariantStudy study;

    public VariantRunner(VariantStudy study, VariantReader reader, PedDataReader pedReader, List<VariantWriter> writer, List<Task<Variant>> tasks) {
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

    @Override
    protected void readerInit() {
        super.readerInit();
        study.addMetadata("variant_file_header", ((VariantReader) reader).getHeader());
        study.setSamples(((VariantReader) reader).getSampleNames());
    }

}
