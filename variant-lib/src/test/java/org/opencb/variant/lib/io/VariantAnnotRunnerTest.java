package org.opencb.variant.lib.io;

import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TestName;
import org.opencb.commons.bioformats.variant.vcf4.annotators.VcfAnnotator;
import org.opencb.commons.bioformats.variant.vcf4.annotators.VcfControlAnnotator;
import org.opencb.variant.lib.runners.VariantAnnotRunner;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: aaleman
 * Date: 9/23/13
 * Time: 4:20 PM
 * To change this template use File | Settings | File Templates.
 */
public class VariantAnnotRunnerTest {

    private String fileIn = "/home/aaleman/tmp/file.vcf";
    private String fileOut = "/home/aaleman/tmp/file_annot.vcf";
    private String controlBIER = "/media/data/controls/bier/bier.gz";
    private String control1000GList = "/media/data/controls/1000genomes/list.txt";
    private long start;
    private long end;


    @Rule
    public TestName name = new TestName();

    @Before
    public void setUp() throws Exception {
        start = System.currentTimeMillis();

    }

    @After
    public void tearDown() throws Exception {
        end = System.currentTimeMillis();
        System.out.println("Time " + name.getMethodName() + ": " + (end - start));
    }

    @Test
    public void annot() {

//        VariantAnnotRunner vr = new VariantAnnotRunner(fileIn, fileOut);
//
//        List<VcfAnnotator> list = new ArrayList<>();
//        try {
//            list.add(new VcfControlAnnotator("BIER", controlBIER));
//            vr.annotations(list);
//            vr.parallel(4).run();
//        } catch (IOException e) {
//            e.printStackTrace();
//        }

    }

//    @Test
//    public void annots4() {
//
//        fileIn = "/home/aaleman/tmp/sma/s4/s4.vcf";
//        fileOut = "/home/aaleman/tmp/sma/s4/s4_annot.vcf";
//
//
//        VariantAnnotRunner vr = new VariantAnnotRunner(fileIn, fileOut);
//
//        List<VcfAnnotator> list = new ArrayList<>();
//
//        try {
//            list.add(new VcfControlAnnotator("BIER", controlBIER));
//
//
//            HashMap<String, String> controlList = getControlList(control1000GList);
//
//            list.add(new VcfControlAnnotator("1000G", controlList));
//
//            vr.annotations(list);
//            vr.run();
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
//
//    }
//
//    @Test
//    public void annots5500() {
//
//        fileIn = "/home/aaleman/tmp/sma/s5500/s5500.vcf";
//        fileOut = "/home/aaleman/tmp/sma/s5500/s5500_annot.vcf";
//
//
//        VariantAnnotRunner vr = new VariantAnnotRunner(fileIn, fileOut);
//
//        List<VcfAnnotator> list = new ArrayList<>();
//
//        try {
//            list.add(new VcfControlAnnotator("BIER", controlBIER));
//
//
//            HashMap<String, String> controlList = getControlList(control1000GList);
//
//            list.add(new VcfControlAnnotator("1000G", controlList));
//
//            vr.annotations(list);
//            vr.run();
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
//
//    }
//
//    @Test
//    public void annotCT(){
//        fileIn = "/home/javi/tmp/prueba.vcf";
//        fileOut = "/home/javi/tmp/small_out.vcf";
//
//        VariantAnnotRunner vr = new VariantAnnotRunner(fileIn, fileOut);
//        List<VcfAnnotator> list = new ArrayList<>();
//
//        list.add(new VcfConsequenceTypeAnnotator());
//        list.add(new VcfGeneNameAnnotator());
//
//        vr.annotations(list);
//
//        vr.run();
//
//
//    }
//
//
//    private HashMap<String, String> getControlList(String filename) {
//        String line;
//        HashMap<String, String> map = new LinkedHashMap<>();
//        try {
//
//            BufferedReader reader = new BufferedReader(new FileReader(filename));
//
//            while ((line = reader.readLine()) != null) {
//                String[] fields = line.split("\t");
//                map.put(fields[0], fields[1]);
//
//            }
//            reader.close();
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
//
//        return map;
//    }


}
