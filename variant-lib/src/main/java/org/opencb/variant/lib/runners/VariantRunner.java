package org.opencb.variant.lib.runners;

import org.opencb.commons.bioformats.pedigree.io.readers.PedDataReader;
import org.opencb.commons.bioformats.variant.VariantStudy;
import org.opencb.commons.bioformats.variant.vcf4.VcfRecord;
import org.opencb.commons.bioformats.variant.vcf4.io.readers.VariantDataReader;
import org.opencb.commons.io.DataWriter;
import org.opencb.commons.run.Runner;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: aaleman
 * Date: 10/24/13
 * Time: 11:50 AM
 * To change this template use File | Settings | File Templates.
 */
public abstract class VariantRunner extends Runner<VariantDataReader, DataWriter, VcfRecord> {

    protected org.slf4j.Logger logger = LoggerFactory.getLogger(this.getClass());
    protected PedDataReader pedReader;
    protected VariantStudy study;

    public VariantRunner(VariantStudy study, VariantDataReader reader, PedDataReader pedReader, DataWriter writer) {
        super(reader, writer);
        this.study = study;
        this.reader = reader;
        this.pedReader = pedReader;
        this.writer = writer;
    }

    public VariantRunner(VariantStudy study, VariantDataReader reader, PedDataReader pedReader, DataWriter writer, VariantRunner prev) {
        this(study, reader, pedReader, writer);
        this.prev = prev;
    }

    public VariantStudy getStudy() {
        return study;
    }

    public void setStudy(VariantStudy study) {
        this.study = study;
    }

    public void run() throws IOException {
        List<VcfRecord> batch;

        reader.open();
        reader.pre();

        if (pedReader != null) {
            pedReader.open();
            study.setPedigree(pedReader.read());
            pedReader.close();
        }
        study.addMetadata("variant_file_header", reader.getHeader());
        study.setSamples(reader.getSampleNames());

        this.writerOpen();
        this.writerPre();

        this.launchPre();

        batch = reader.read(batchSize);
        while (!batch.isEmpty()) {

            batch = this.launch(batch);
            batch.clear();
            batch = reader.read(batchSize);

        }

        this.launchPost();

        reader.post();
        reader.close();

        this.writerPost();
        this.writerClose();

    }
}
