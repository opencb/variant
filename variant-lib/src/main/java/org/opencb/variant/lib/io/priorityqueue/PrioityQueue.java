package org.opencb.variant.lib.io.priorityqueue;

import java.util.concurrent.PriorityBlockingQueue;
import java.util.concurrent.TimeUnit;

/**
 * Created with IntelliJ IDEA.
 * User: aaleman
 * Date: 10/7/13
 * Time: 10:16 AM
 * To change this template use File | Settings | File Templates.
 */
public class PrioityQueue<T> extends PriorityBlockingQueue<T> {

    private int currentElement;


    public PrioityQueue(int i) {
        super(i);
        this.currentElement = 0;
    }

}
