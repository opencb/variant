package org.opencb.variant.lib.runners;

import org.opencb.commons.bioformats.commons.DataWriter;
import org.opencb.commons.bioformats.variant.vcf4.VcfRecord;
import org.opencb.commons.bioformats.variant.vcf4.io.readers.VariantDataReader;
import org.slf4j.LoggerFactory;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.List;
import java.util.logging.Logger;

/**
 * Created with IntelliJ IDEA.
 * User: aaleman
 * Date: 10/24/13
 * Time: 11:50 AM
 * To change this template use File | Settings | File Templates.
 */
public abstract class VariantRunner {

    protected org.slf4j.Logger logger = LoggerFactory.getLogger(this.getClass());
    protected VariantDataReader reader;
    protected DataWriter writer;
    protected VariantRunner prev;
    protected int batchSize = 1000;

    public VariantRunner(VariantDataReader reader, DataWriter writer) {
        this.reader = reader;
        this.writer = writer;

    }

    public VariantRunner(VariantDataReader reader, DataWriter writer, VariantRunner prev) {
        this(reader, writer);
        this.prev = prev;
    }

    public abstract List<VcfRecord> apply(List<VcfRecord> batch) throws IOException;

    public void pre() throws IOException {
        logger.debug(this.getClass().getSimpleName() + " Empty pre");
    }

    public void post() throws IOException {
        logger.debug(this.getClass().getSimpleName() + " Empty post");
    }

    public void run() throws IOException {
        List<VcfRecord> batch;

        int cont = 0;
        reader.open();
        reader.pre();

        this.writerOpen();
        this.writerPre();

        this.launchPre();

        batch = reader.read(batchSize);
        while (!batch.isEmpty()) {

            logger.debug("Batch: " + cont++);
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

    public List<VcfRecord> launch(List<VcfRecord> batch) throws IOException {

        if (prev != null) {
            batch = prev.launch(batch);
        }

        batch = this.apply(batch);
        return batch;
    }

    public void launchPre() throws IOException {
        if (prev != null) {
            prev.launchPre();
        }
        this.pre();
    }

    public void launchPost() throws IOException {
        if (prev != null) {
            prev.launchPost();
        }
        this.post();
    }

    public void writerPre() {
        if (prev != null) {
            prev.writerPre();
        }
        if (writer != null)
            writer.pre();
    }

    public void writerOpen() {
        if (prev != null) {
            prev.writerOpen();
        }
        if (writer != null)
            writer.open();
    }

    public void writerPost() {
        if (prev != null) {
            prev.writerPost();
        }
        if (writer != null)
            writer.post();
    }

    public void writerClose() {
        if (prev != null) {
            prev.writerClose();
        }
        if (writer != null)
            writer.close();
    }


}
