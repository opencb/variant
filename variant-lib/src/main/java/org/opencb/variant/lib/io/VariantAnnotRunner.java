package org.opencb.variant.lib.io;

import org.opencb.variant.lib.annot.Annot;
import org.opencb.variant.lib.core.formats.VcfRecord;
import org.opencb.variant.lib.io.priorityqueue.DataItem;
import org.opencb.variant.lib.io.priorityqueue.DataRW;
import org.opencb.variant.lib.io.variant.annotators.VcfAnnotator;
import org.opencb.variant.lib.io.variant.readers.VariantDataReader;
import org.opencb.variant.lib.io.variant.readers.VariantVcfDataReader;
import org.opencb.variant.lib.io.variant.writers.VariantDataWriter;
import org.opencb.variant.lib.io.variant.writers.VariantVcfDataWriter;

import java.util.List;
import java.util.concurrent.*;

/**
 * Created with IntelliJ IDEA.
 * User: aleman
 * Date: 9/13/13
 * Time: 8:01 PM
 * To change this template use File | Settings | File Templates.
 */
public class VariantAnnotRunner {

    private VariantDataReader vcfReader;
    private VariantDataWriter vcfWriter;
    private List<VcfAnnotator> annots;
    private int batchSize = 1000;
    private int threads;


    public VariantAnnotRunner() {
        this.threads = 2;
    }

    public VariantAnnotRunner(String vcfFileName, String vcfOutFilename) {
        this();

        vcfReader = new VariantVcfDataReader(vcfFileName);
        vcfWriter = new VariantVcfDataWriter(vcfOutFilename);

    }

    public VariantAnnotRunner parallel(int numThreads) {
        this.threads = numThreads;
        return this;
    }

    public void run() {

        vcfReader.open();
        vcfWriter.open();

        vcfReader.pre();
        vcfWriter.pre();


        DataRW<List<VcfRecord>, List<VcfRecord>> data = new DataRW<>();

        ExecutorService threadPool = Executors.newFixedThreadPool(2 + this.threads);

        for (int i = 0; i < this.threads; i++) {

            threadPool.execute(new Annotator(data));
        }

        Future producerStatus = threadPool.submit(new Reader(data));
        Future writer = threadPool.submit(new Writer(data));

        try {
            producerStatus.get();
            writer.get();
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        }
        threadPool.shutdown();

        vcfReader.post();
        vcfWriter.post();

        vcfReader.close();
        vcfWriter.close();

    }

    public void annotations(List<VcfAnnotator> listAnnots) {
        this.annots = listAnnots;
    }

    private class Reader implements Runnable {

        private DataRW<List<VcfRecord>, List<VcfRecord>> data;
        private int count;

        private Reader(DataRW data) {
            this.data = data;
            this.count = 0;

        }

        @Override
        public void run() {
            List<VcfRecord> batch;

            batch = vcfReader.read(batchSize);

            System.out.println("START READER");
            vcfWriter.writeVcfHeader(vcfReader.getHeader());
            while (!batch.isEmpty()) {
                data.putRead(count++, batch);
                batch = vcfReader.read(batchSize);
            }

            data.setContinueProducing(false);

            System.out.println("END READER");

        }
    }

    private class Annotator implements Runnable {

        private DataRW<List<VcfRecord>, List<VcfRecord>> data;

        private Annotator(DataRW data) {
            this.data = data;
            this.data.incConsumer();
        }

        @Override
        public void run() {


            System.out.println("START ANNOTATOR");
            DataItem<List<VcfRecord>> dataItem = data.getRead();
            List<VcfRecord> batch;
            int priority;

            while (data.isContinueProducing() || dataItem != null) {
                batch = dataItem.getData();
                priority = dataItem.getPriority();

                Annot.applyAnnotations(batch, annots);

                data.putWrite(priority, batch);

                dataItem = data.getRead();
            }

            System.out.println("END ANNOTATOR");
            this.data.decConsumer();
        }
    }

    private class Writer implements Runnable {

        private DataRW<List<VcfRecord>, List<VcfRecord>> data;

        private Writer(DataRW data) {
            this.data = data;
        }

        @Override
        public void run() {

            System.out.println("START WRITER");

            DataItem<List<VcfRecord>> dataItem;
            List<VcfRecord> batch;
            dataItem = data.getWrite();

            while (dataItem != null) {
                batch = dataItem.getData();
                System.out.println("Writing: " + dataItem.getPriority());
                vcfWriter.writeBatch(batch);
                batch.clear();
                dataItem = data.getWrite();
            }
            System.out.println("END WRITER");
        }
    }
}