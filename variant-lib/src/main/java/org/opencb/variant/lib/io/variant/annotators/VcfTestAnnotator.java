package org.opencb.variant.lib.io.variant.annotators;

import org.opencb.variant.lib.core.formats.VcfRecord;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: aleman
 * Date: 10/5/13
 * Time: 10:25 AM
 * To change this template use File | Settings | File Templates.
 */
public class VcfTestAnnotator implements VcfAnnotator {

    private String text;

    public VcfTestAnnotator(String text) {
        this.text = text;
    }

    @Override
    public void annot(List<VcfRecord> batch) {
        for (VcfRecord v : batch) {
            this.annot(v);
        }
    }

    @Override
    public void annot(VcfRecord elem) {
        elem.setId(text);
    }
}
