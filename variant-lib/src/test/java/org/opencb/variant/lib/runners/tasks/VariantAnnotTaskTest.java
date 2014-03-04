package org.opencb.variant.lib.runners.tasks;

import org.junit.Test;
import org.opencb.commons.bioformats.variant.Variant;
import org.opencb.commons.bioformats.variant.annotators.VariantAnnotator;
import org.opencb.commons.bioformats.variant.annotators.VariantControlMongoAnnotator;
import org.opencb.commons.bioformats.variant.vcf4.io.readers.VariantVcfReader;
import org.opencb.commons.io.DataReader;
import org.opencb.commons.test.GenericTest;

import java.util.List;

/**
 * @author Alejandro Aleman Ramos <aaleman@cipf.es>
 */
public class VariantAnnotTaskTest extends GenericTest {


    @Test
    public void testName() throws Exception {
        DataReader<Variant> reader = new VariantVcfReader("/home/aaleman/Documents/workspace/cipf/appl/java-common-libs/bioformats/target/test-classes/variant-test-file.vcf.gz");

        VariantAnnotator control = new VariantControlMongoAnnotator();


        reader.open();
        reader.pre();

        List<Variant> batch = reader.read(10);

        while (!batch.isEmpty()) {


            control.annot(batch);

            return;
//            batch.clear();
//            batch = reader.read(10);
        }

        reader.post();
        reader.close();


    }
}
