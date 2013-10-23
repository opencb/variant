package org.opencb.variant.lib.runners;

import org.opencb.commons.bioformats.commons.filters.FilterApplicator;
import org.opencb.commons.bioformats.variant.vcf4.VcfRecord;
import org.opencb.commons.bioformats.variant.vcf4.filters.VcfFilter;
import org.opencb.commons.bioformats.variant.vcf4.io.readers.VariantDataReader;
import org.opencb.commons.bioformats.variant.vcf4.io.readers.VariantVcfDataReader;
import org.opencb.commons.bioformats.variant.vcf4.io.writers.vcf.VariantDataWriter;
import org.opencb.commons.bioformats.variant.vcf4.io.writers.vcf.VariantVcfDataWriter;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: aleman
 * Date: 9/13/13
 * Time: 8:01 PM
 * To change this template use File | Settings | File Templates.
 */
public class VariantFilterRunner {

    private VariantDataReader vcfReader;
    private VariantDataWriter vcfWriter;
    private List<VcfFilter> filters;


    public VariantFilterRunner() {
    }

    public VariantFilterRunner(String vcfFileName, String vcfOutFilename) {
        this();

        vcfReader = new VariantVcfDataReader(vcfFileName);
        vcfWriter = new VariantVcfDataWriter(vcfOutFilename);

    }

    public void run() {

        int batchSize = 1000;
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

            batch = FilterApplicator.filter(batch, filters);

            vcfWriter.writeBatch(batch);

            batch = vcfReader.read(batchSize);

        }

        vcfReader.post();
        vcfWriter.post();

        vcfReader.close();
        vcfWriter.close();

    }

    public void filters(List<VcfFilter> filters) {
        this.filters = filters;
    }


    public VariantFilterRunner reader(VariantDataReader reader) {
        this.vcfReader = reader;
        return this;
    }

    public VariantFilterRunner writer(VariantDataWriter writer) {
        this.vcfWriter = writer;
        return this;
    }
}
