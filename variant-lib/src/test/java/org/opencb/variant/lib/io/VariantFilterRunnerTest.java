package org.opencb.variant.lib.io;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.opencb.commons.bioformats.variant.vcf4.filters.VcfConsequenceTypeFilter;
import org.opencb.commons.bioformats.variant.vcf4.filters.VcfFilter;
import org.opencb.variant.lib.runners.VariantFilterRunner;

import java.util.ArrayList;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: javi
 * Date: 26/09/13
 * Time: 18:44
 * To change this template use File | Settings | File Templates.
 */
public class VariantFilterRunnerTest {
    @Before
    public void setUp() throws Exception {

    }

    @After
    public void tearDown() throws Exception {

    }

    @Test
    public void filterCT(){
        String fileIn = "/home/javi/tmp/small_annot.vcf";
        String fileOut = "/home/javi/tmp/small_out.vcf";

        VariantFilterRunner vr = new VariantFilterRunner(fileIn, fileOut);
        List<VcfFilter> list = new ArrayList<>();


        list.add(new VcfConsequenceTypeFilter("DNAseI_hypersensitive_site"));


        vr.filters(list);

        vr.run();


    }
}
