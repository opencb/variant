package org.opencb.variant.lib.io.priorityqueue;

/**
 * Created with IntelliJ IDEA.
 * User: aaleman
 * Date: 10/7/13
 * Time: 10:18 AM
 * To change this template use File | Settings | File Templates.
 */
public class DataItem<T> implements Comparable<DataItem<T>> {
    private int priority;
    private T data;

    public DataItem(int priority, T data) {
        this.priority = priority;
        this.data = data;
    }

    public int getPriority() {
        return priority;
    }

    public void setPriority(int priority) {
        this.priority = priority;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    @Override
    public int compareTo(DataItem<T> o) {
        return (this.getPriority() - o.getPriority());
    }
}
