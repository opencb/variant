package org.opencb.variant.lib.runners;

import java.util.List;
import org.opencb.biodata.formats.pedigree.io.PedigreeReader;
import org.opencb.biodata.formats.variant.io.VariantReader;
import org.opencb.biodata.formats.variant.io.VariantWriter;
import org.opencb.biodata.models.variant.Variant;
import org.opencb.biodata.models.variant.VariantSource;
import org.opencb.commons.run.Runner;
import org.opencb.commons.run.Task;
/**
 * @author Alejandro Aleman Ramos <aaleman@cipf.es>
 * @author Cristina Yenyxe Gonzalez Garcia <cgonzalez@cipf.es>
 */
public class VariantRunner extends Runner<Variant> {

    protected VariantSource study;

    public VariantRunner(VariantSource study, VariantReader reader, PedigreeReader pedReader, List<VariantWriter> writer, List<Task<Variant>> tasks) {
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

    public VariantSource getStudy() {
        return study;
    }

    public void setStudy(VariantSource study) {
        this.study = study;
    }

    @Override
    protected void readerInit() {
        super.readerInit();
        study.addMetadata("variant_file_header", ((VariantReader) reader).getHeader());
        study.setSamples(((VariantReader) reader).getSampleNames());
    }

}
