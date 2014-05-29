package org.opencb.variant.lib.runners.tasks;

import java.util.List;
import org.junit.Test;
import org.opencb.biodata.formats.variant.vcf4.io.VariantVcfReader;
import org.opencb.biodata.models.variant.Variant;
import org.opencb.biodata.models.variant.VariantSource;
import org.opencb.biodata.tools.variant.annotation.VariantAnnotator;
import org.opencb.biodata.tools.variant.annotation.VariantControlMongoAnnotator;
import org.opencb.commons.io.DataReader;
import org.opencb.commons.test.GenericTest;

/**
 * @author Alejandro Aleman Ramos <aaleman@cipf.es>
 */
public class VariantAnnotTaskTest extends GenericTest {

    private String inputFile = getClass().getResource("/variant-test-file.vcf.gz").getFile();
    private VariantSource source = new VariantSource(inputFile, "test", "testStudy", "Study for testing purposes");

    @Test
    public void testName() throws Exception {
        DataReader<Variant> reader = new VariantVcfReader(source, inputFile);

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
