package org.opencb.variant.cli;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.*;
import org.apache.commons.cli.*;
import org.opencb.biodata.formats.variant.io.VariantReader;
import org.opencb.biodata.formats.variant.io.VariantWriter;
import org.opencb.biodata.formats.variant.vcf4.io.VariantVcfDataWriter;
import org.opencb.biodata.formats.variant.vcf4.io.VariantVcfReader;
import org.opencb.biodata.models.variant.Variant;
import org.opencb.biodata.models.variant.VariantSource;
import org.opencb.biodata.tools.variant.annotation.VariantAnnotator;
import org.opencb.biodata.tools.variant.annotation.VariantConsequenceTypeAnnotator;
import org.opencb.biodata.tools.variant.annotation.VariantControlAnnotator;
import org.opencb.biodata.tools.variant.annotation.VariantControlMongoAnnotator;
import org.opencb.biodata.tools.variant.annotation.VariantGenesAnnotator;
import org.opencb.biodata.tools.variant.annotation.VariantPolyphenSIFTAnnotator;
import org.opencb.biodata.tools.variant.annotation.VariantSNPAnnotator;
import org.opencb.biodata.tools.variant.filtering.VariantBedFilter;
import org.opencb.biodata.tools.variant.filtering.VariantConsequenceTypeFilter;
import org.opencb.biodata.tools.variant.filtering.VariantFilter;
import org.opencb.biodata.tools.variant.filtering.VariantGeneFilter;
import org.opencb.biodata.tools.variant.filtering.VariantRegionFilter;
import org.opencb.biodata.tools.variant.filtering.VariantSnpFilter;
import org.opencb.commons.containers.list.SortedList;
import org.opencb.commons.run.Task;
import org.opencb.variant.lib.runners.VariantRunner;
import org.opencb.variant.lib.runners.tasks.VariantAnnotTask;
import org.opencb.variant.lib.runners.tasks.VariantEffectTask;
import org.opencb.variant.lib.runners.tasks.VariantFilterTask;
import org.opencb.variant.lib.runners.tasks.VariantStatsTask;


/**
 * @author Alejandro Aleman Ramos <aaleman@cipf.es>
 * @author Cristina Yenyxe Gonzalez Garcia <cyenyxe@ebi.ac.uk>
 */
public class VariantMain {

    private static Options options;
    private static CommandLine commandLine;
    private static CommandLineParser parser;
    private static HelpFormatter help;

    static {
        parser = new PosixParser();
        help = new HelpFormatter();
    }

    private static void initOptions() {
        options = new Options();

        options.addOption(OptionFactory.createOption("help", "h", "Print this message", false, false));
        options.addOption(OptionFactory.createOption("vcf-file", "Input VCF file", true, true));
        options.addOption(OptionFactory.createOption("outdir", "o", "Output dir", true, true));
        options.addOption(OptionFactory.createOption("output-file", "Output filename", true, true));
        options.addOption(OptionFactory.createOption("ped-file", "Ped file", false, true));
        options.addOption(OptionFactory.createOption("threads", "Num threads", false, true));
        options.addOption(OptionFactory.createOption("batch-size", "Batch Size (Default: 1000)", false, true));

        options.addOption(OptionFactory.createOption("filter", "Filter vcf file", false, false));
        options.addOption(OptionFactory.createOption("annot", "Annotate vcf file", false, false));
        options.addOption(OptionFactory.createOption("effect", "Calculate Effect", false, false));
        options.addOption(OptionFactory.createOption("stats", "Calculate Stats", false, false));
        options.addOption(OptionFactory.createOption("index", "Generate Index", false, false));

        options.addOption(OptionFactory.createOption("all", "Run all tools", false, false));

        // ANNOTS
        options.addOption(OptionFactory.createOption("annot-control-list", "Control filename list", false, true));
        options.addOption(OptionFactory.createOption("annot-control-file", "Control filename", false, true));
        options.addOption(OptionFactory.createOption("annot-control-prefix", "Control prefix", false, true));
        options.addOption(OptionFactory.createOption("annot-control-evs", "Control EVS", false, true));
        options.addOption(OptionFactory.createOption("annot-snp", "SNP", false, false));
        options.addOption(OptionFactory.createOption("annot-ct", "Annot Consequence Type", false, false));
        options.addOption(OptionFactory.createOption("annot-genename", "Annot Genename", false, false));
        options.addOption(OptionFactory.createOption("annot-polyphen-sift", "Annot Polyphen & SIFT", false, false));
        options.addOption(OptionFactory.createOption("annot-control", "Control Annot", false, false));


        // FILTERS
        options.addOption(OptionFactory.createOption("filter-region", "Filter Region (chr:start-end)", false, true));
        options.addOption(OptionFactory.createOption("filter-bed", "Filter Bed ", false, true));
        options.addOption(OptionFactory.createOption("filter-snp", "Filter SNP", false, false));
        options.addOption(OptionFactory.createOption("filter-ct", "Filter Consequence Type", false, true));
        options.addOption(OptionFactory.createOption("filter-gene", "Filter Gene (BRCA2,PPL)", false, true));
        options.addOption(OptionFactory.createOption("filter-gene-file", "Filter Gene gene_list.txt", false, true));
        options.addOption(OptionFactory.createOption("filter-retain", "Retain variants from vcf file)", false, true));


    }

    public static void main(String[] args) throws IOException, InterruptedException {
        initOptions();

        List<Tool> toolList = new ArrayList<>(5);

        int numThreads = 1;
        int batchSize = 1000;


        parse(args, false);
        String outputFile = "data.db";
        String inputFile;

        if (commandLine.hasOption("output-file")) {
            outputFile = commandLine.getOptionValue("output-file");
        }

        if (commandLine.hasOption("batch-size")) {
            batchSize = Integer.parseInt(commandLine.getOptionValue("batch-size"));
        }

        inputFile = commandLine.getOptionValue("vcf-file");
        outputFile = commandLine.getOptionValue("outdir") + "/" + outputFile;

        if (commandLine.hasOption("all")) {
            toolList.add(Tool.FILTER);
            toolList.add(Tool.ANNOT);
            toolList.add(Tool.EFFECT);
            toolList.add(Tool.STATS);
            toolList.add(Tool.INDEX);
        } else {

            if (commandLine.hasOption("filter")) {
                toolList.add(Tool.FILTER);
            }
            if (commandLine.hasOption("annot")) {
                toolList.add(Tool.ANNOT);
            }
            if (commandLine.hasOption("effect")) {
                toolList.add(Tool.EFFECT);
            }
            if (commandLine.hasOption("stats")) {
                toolList.add(Tool.STATS);
            }
            if (commandLine.hasOption("index")) {
                toolList.add(Tool.INDEX);
            }
        }

        System.out.println("toolList = " + toolList);

        VariantRunner vr;
        String pedFile = null;

        List<Task<Variant>> taskList = new SortedList<>();
        List<VariantWriter> writers = new ArrayList<>();

        VariantSource study = new VariantSource(inputFile, "f1", "s1", "Study 1");
        VariantReader reader = new VariantVcfReader(study, inputFile);
        VariantWriter writer = new VariantVcfDataWriter(reader, outputFile);

        List<VariantFilter> filters = parseFilters(commandLine);
        List<VariantAnnotator> annots = parseAnnotations(commandLine);

        writers.add(writer);

        for (Tool t : toolList) {
            System.out.println("t = " + t);
            switch (t) {
                case FILTER:
                    taskList.add(new VariantFilterTask(filters, Integer.MAX_VALUE));
                    break;
                case ANNOT:
                    taskList.add(new VariantAnnotTask(annots));
                    break;
                case EFFECT:
                    taskList.add(new VariantEffectTask());
                    break;
                case STATS:
                    taskList.add(new VariantStatsTask(reader, study));
                    break;

            }
        }

        for (Task<Variant> t : taskList) {
            System.out.println(t.getClass().getCanonicalName());
        }

        System.out.println("START");

        vr = new VariantRunner(study, reader, null, writers, taskList);
        vr.setBatchSize(batchSize);

        vr.run();
        System.out.println("END");

    }

    private static List<VariantAnnotator> parseAnnotations(CommandLine commandLine) {
        List<VariantAnnotator> annots = new ArrayList<>();

        if (commandLine.hasOption("annot-polyphen-sift")) {
            annots.add(new VariantPolyphenSIFTAnnotator());
        }

//        if (commandLine.hasOption("annot-control-list")) {
//            String infoPrefix = commandLine.hasOption("annot-control-prefix") ? commandLine.getOptionValue("annot-control-prefix") : "CONTROL";
//            Map<String, String> controlList = getControlList(commandLine.getOptionValue("annot-control-list"));
//            annots.add(new VariantControlAnnotator(infoPrefix, controlList));
        if (commandLine.hasOption("annot-control-file")) {
            String infoPrefix = commandLine.hasOption("annot-control-prefix") ? commandLine.getOptionValue("annot-control-prefix") : "CONTROL";
            annots.add(new VariantControlAnnotator(infoPrefix, commandLine.getOptionValue("annot-control-file")));
        }
//
//        if (commandLine.hasOption("annot-control-evs")) {
//            String infoPrefix = commandLine.hasOption("annot-control-prefix") ? commandLine.getOptionValue("annot-control-prefix") : "EVS";
//            annots.add(new VariantEVSControlAnnotator(infoPrefix, commandLine.getOptionValue("annot-control-evs")));
//        }

        if (commandLine.hasOption("annot-snp")) {
            annots.add(new VariantSNPAnnotator());
        }

        if (commandLine.hasOption("annot-ct")) {
            annots.add(new VariantConsequenceTypeAnnotator());
        }

        if (commandLine.hasOption("annot-genename")) {
            annots.add(new VariantGenesAnnotator());
        }

        if (commandLine.hasOption("annot-control")) {
            annots.add(new VariantControlMongoAnnotator());
        }

        return annots;
    }

    private static List<VariantFilter> parseFilters(CommandLine commandLine) {
        List<VariantFilter> filters = new ArrayList<>();

        if (commandLine.hasOption("filter-region")) {
            filters.add(new VariantRegionFilter(commandLine.getOptionValue("filter-region"), Integer.MAX_VALUE));
        }

        if (commandLine.hasOption("filter-bed")) {
            filters.add(new VariantBedFilter(commandLine.getOptionValue("filter-bed"), Integer.MAX_VALUE));
        }

        if (commandLine.hasOption("filter-snp")) {
            filters.add(new VariantSnpFilter());
        }

        if (commandLine.hasOption("filter-ct")) {
            filters.add(new VariantConsequenceTypeFilter(commandLine.getOptionValue("filter-ct")));
        }

        if (commandLine.hasOption("filter-gene")) {
            filters.add(new VariantGeneFilter(commandLine.getOptionValue("filter-gene")));
        } else if (commandLine.hasOption("filter-gene-file")) {
            filters.add(new VariantGeneFilter(new File(commandLine.getOptionValue("filter-gene-file"))));
        }

        return filters;
    }

    private static Map<String, String> getControlList(String filename) {
        String line;
        Map<String, String> map = new LinkedHashMap<>();
        try {

            BufferedReader reader = new BufferedReader(new FileReader(filename));

            while ((line = reader.readLine()) != null) {
                String[] fields = line.split("\t");
                map.put(fields[0], fields[1]);

            }
            reader.close();
        } catch (IOException e) {
            e.printStackTrace();
        }

        return map;
    }

    private static boolean checkCommand(String command) {
        return command.equalsIgnoreCase("stats") || command.equalsIgnoreCase("filter") || command.equalsIgnoreCase("index") || command.equalsIgnoreCase("annot") || command.equalsIgnoreCase("test");
    }

    private static void parse(String[] args, boolean stopAtNoOption) {
        parser = new PosixParser();

        try {
            commandLine = parser.parse(options, args, stopAtNoOption);
        } catch (ParseException e) {
            System.err.println(e.getMessage());
            help.printHelp("variant", options);
            System.exit(-1);
        }
    }

    private enum Tool {FILTER, ANNOT, EFFECT, STATS, INDEX}
}
