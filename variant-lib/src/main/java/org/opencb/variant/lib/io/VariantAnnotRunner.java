package org.opencb.variant.lib.io;

import org.opencb.variant.lib.annot.Annot;
import org.opencb.variant.lib.core.formats.VcfRecord;
import org.opencb.variant.lib.io.variant.annotators.VcfAnnotator;
import org.opencb.variant.lib.io.variant.readers.VariantDataReader;
import org.opencb.variant.lib.io.variant.readers.VariantVcfDataReader;
import org.opencb.variant.lib.io.variant.writers.VariantDataWriter;
import org.opencb.variant.lib.io.variant.writers.VariantVcfDataWriter;

import java.util.HashMap;
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

    public VariantAnnotRunner parallel(int numThreads){
        this.threads = numThreads;
        return this;
    }

    public void run(){

        vcfReader.open();
        vcfWriter.open();

        vcfReader.pre();
        vcfWriter.pre();


        Data data = new Data();

        ExecutorService threadPool = Executors.newFixedThreadPool(2 + this.threads);

        for(int i = 0; i < this.threads; i++ ){

            threadPool.execute(new Consumer( data));
        }

        Future producerStatus = threadPool.submit(new Producer(data));
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

    /*public void run() {

        int cont = 1;
        List<VcfRecord> batch;

        vcfReader.open();
        vcfWriter.open();

        vcfReader.pre();
        vcfWriter.pre();

        batch = vcfReader.read(batchSize);

        vcfWriter.writeVcfHeader(vcfReader.getHeader());

        while (!batch.isEmpty()) {

            System.out.println("Batch: " + cont++);

            Annot.applyAnnotations(batch, this.annots);

            vcfWriter.writeBatch(batch);

            batch = vcfReader.read(batchSize);

        }

        vcfReader.post();
        vcfWriter.post();

        vcfReader.close();
        vcfWriter.close();

    }*/

    public void annotations(List<VcfAnnotator> listAnnots) {
        this.annots = listAnnots;
    }
    private class Data{

        private BlockingQueue<List<VcfRecord>> read;
        private BlockingQueue<List<VcfRecord>> write;
        private int numConsumers;
        private boolean continueProducing = true;

        private Data() {
            read = new ArrayBlockingQueue<>(10);
            write = new ArrayBlockingQueue<>(10);
            numConsumers = 0;
        }

        public void putRead(List<VcfRecord> batch){
            try {
                this.read.put(batch);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        public List<VcfRecord> getRead(){
            if(!continueProducing && read.size() == 0){
                return null;
            }
            try {
                return this.read.take();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            return null;
        }

        public void putWrite(List<VcfRecord> batch){
            try {
                this.write.put(batch);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        public List<VcfRecord> getWrite(){
            try {
                return this.write.take();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            return null;
        }public List<VcfRecord> getPollWrite(){
            return this.write.poll();
        }

        public int writeSize(){
            return this.write.size();
        }



        public void incConsumer(){
            this.numConsumers++;
        }

        private int getNumConsumers() {
            return numConsumers;
        }

        public void decConsumer(){
            this.numConsumers--;

        }

        public String toString(){

            return read.size() + " - " + write.size();
        }




    }
    private class Producer implements Runnable{

        private Data data;

        private Producer(Data data) {
            this.data = data;
        }

        @Override
        public void run() {
            List<VcfRecord> batch;

            batch = vcfReader.read(batchSize);

            System.out.println("START READER");
            vcfWriter.writeVcfHeader(vcfReader.getHeader());
            while(!batch.isEmpty()){
                data.putRead(batch);
                batch = vcfReader.read(batchSize);
            }

            data.continueProducing = false;

            System.out.println("END READER");

        }
    }

    private class Consumer implements  Runnable{

        private Data data;

        private Consumer(Data data) {
            this.data = data;
            this.data.incConsumer();
        }

        @Override
        public void run() {


            System.out.println("START CONSUMER");
            List<VcfRecord> batch = data.getRead();

            while(data.continueProducing ||  batch != null){

                Annot.applyAnnotations(batch, annots);

                data.putWrite(batch);

                batch = data.getRead();
            }

            System.out.println("END CONSUMER");
            this.data.decConsumer();


        }
    }

    private class Writer implements Runnable{

        private Data data;

        private Writer(Data data) {
            this.data = data;
        }

        @Override
        public void run() {


            List<VcfRecord> batch;

            while( data.getNumConsumers() > 0){
                batch = data.getWrite();

                vcfWriter.writeBatch(batch);

                batch.clear();

            }

            if(data.writeSize() > 0){
                batch = data.getPollWrite();
                while(batch != null){
                    vcfWriter.writeBatch(batch);

                    batch.clear();
                    batch = data.getPollWrite();
                }
            }
            System.out.println("END WRITER");





        }
    }
}
