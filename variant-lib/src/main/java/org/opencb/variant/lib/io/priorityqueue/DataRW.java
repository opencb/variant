package org.opencb.variant.lib.io.priorityqueue;

import org.opencb.variant.lib.core.formats.VcfRecord;

import java.util.List;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.PriorityBlockingQueue;
import java.util.concurrent.TimeUnit;

/**
 * Created with IntelliJ IDEA.
 * User: aaleman
 * Date: 10/7/13
 * Time: 9:52 AM
 * To change this template use File | Settings | File Templates.
 */
public class DataRW<R, W> {

    private BlockingQueue<DataItem<R>> read;
    private BlockingQueue<DataItem<W>> write;
    private int numConsumers;
    private boolean continueProducing = true;
    private int maxCapacity = 10;
    private int currentElement = 0;

    public DataRW() {
        read = new PriorityBlockingQueue<>(maxCapacity);
        write = new PriorityBlockingQueue<>(maxCapacity);
        numConsumers = 0;
    }

    public void putRead(int i, R batch) {

        try {
            while (read.size() >= maxCapacity) {
                Thread.sleep(10);
            }
            DataItem<R> dr = new DataItem<>(i, batch);
            this.read.put(dr);


        } catch (InterruptedException e) {
            e.printStackTrace();
        }

    }

    public DataItem<R> getRead() {
        try {
            DataItem<R> dr = this.read.poll(1, TimeUnit.SECONDS);
            return dr;

        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        return null;
    }

    public void putWrite(int i, W batch) {


        DataItem<W> dw = new DataItem<>(i, batch);
        try {
            this.write.put(dw);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

    }

    public DataItem<W> getWrite() {
        try {
            while (numConsumers > 0) {
                synchronized (write) {
                    DataItem<W> dw = write.peek();
                    if (dw != null && dw.getPriority() == currentElement) {
                        dw = write.take();
                        currentElement++;
                        return dw;
                    } else {
                        Thread.sleep(10);
                    }
                }

            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        }


        return null;
    }

    public int writeSize() {
        return this.write.size();
    }


    public void incConsumer() {
        this.numConsumers++;
    }

    public int getNumConsumers() {
        return numConsumers;
    }

    public void decConsumer() {
        this.numConsumers--;

    }

    public String toString() {

        return read.size() + " - " + write.size() + " --- " + numConsumers;
    }


    public boolean isContinueProducing() {
        return continueProducing;
    }

    public void setContinueProducing(boolean continueProducing) {
        this.continueProducing = continueProducing;
    }


}