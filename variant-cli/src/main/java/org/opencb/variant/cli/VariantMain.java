package org.opencb.variant.cli;

import org.apache.commons.cli.*;
import org.opencb.commons.bioformats.variant.vcf4.annotators.VcfAnnotator;
import org.opencb.commons.bioformats.variant.vcf4.annotators.VcfTestAnnotator;
import org.opencb.commons.bioformats.variant.vcf4.filters.VcfFilter;
import org.opencb.commons.bioformats.variant.vcf4.filters.VcfRegionFilter;
import org.opencb.commons.bioformats.variant.vcf4.io.readers.VariantDataReader;
import org.opencb.commons.bioformats.variant.vcf4.io.readers.VariantVcfDataReader;
import org.opencb.commons.bioformats.variant.vcf4.io.writers.effect.VariantEffectSqliteDataWriter;
import org.opencb.commons.bioformats.variant.vcf4.io.writers.index.VariantIndexSqliteDataWriter;
import org.opencb.commons.bioformats.variant.vcf4.io.writers.stats.VariantStatsSqliteDataWriter;
import org.opencb.variant.lib.runners.*;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.logging.Logger;

/**
 * Created with IntelliJ IDEA.
 * User: aaleman
 * Date: 9/5/13
 * Time: 11:33 AM
 * To change this template use File | Settings | File Templates.
 */
public class VariantMain {

    private static Options options;
    private static CommandLine commandLine;
    private static CommandLineParser parser;
    private static HelpFormatter help;
    private Logger logger;

    static {
        parser = new PosixParser();
        help = new HelpFormatter();
    }

    private static void initOptions() {
        options = new Options();

        options.addOption(OptionFactory.createOption("help", "h", "Print this message", false, false));
        options.addOption(OptionFactory.createOption("vcf-file", "Input VCF file", true, true));
        options.addOption(OptionFactory.createOption("outdir", "o", "Output dir", true, true));
        options.addOption(OptionFactory.createOption("output-file", "Output filename", false, true));
        options.addOption(OptionFactory.createOption("ped-file", "Ped file", false, true));
//        options.addOption(OptionFactory.createOption("control", "Control filename", false, true));
//        options.addOption(OptionFactory.createOption("control-list", "Control filename list", false, true));
//        options.addOption(OptionFactory.createOption("control-prefix", "Control prefix", false, true));
        options.addOption(OptionFactory.createOption("threads", "Num threads", false, true));

        options.addOption(OptionFactory.createOption("filter", "Filter vcf file", false, false));
        options.addOption(OptionFactory.createOption("annot", "Annotate vcf file", false, false));
        options.addOption(OptionFactory.createOption("effect", "Calculate Effect", false, false));
        options.addOption(OptionFactory.createOption("stats", "Calculate Stats", false, false));
        options.addOption(OptionFactory.createOption("index", "Generate Index", false, false));

        options.addOption(OptionFactory.createOption("all", "Run all tools", false, false));

    }

    public static void main(String[] args) throws IOException, InterruptedException {
        initOptions();


        String in = "/home/aaleman/Documents/pruebas/index/aux.vcf";
        String out = "/home/aaleman/Documents/pruebas/index/out.db";

        List<Tool> toolList = new ArrayList<>(5);

        int numThreads = 1;


        parse(args, false);
        String outputFile = "data.db";
        String inputFile;

        if (commandLine.hasOption("output-file")) {
            outputFile = commandLine.getOptionValue("output-file");
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

        VariantDataReader reader = new VariantVcfDataReader(inputFile);
        List<VcfFilter> filters = new ArrayList<>();
        List<VcfAnnotator> annots = new ArrayList<>();

        VariantRunner vr = null;
        VariantRunner vrAux = null;
        String pedFile = null;

        for (Tool t : toolList) {
            switch (t) {
                case FILTER:
                    vrAux = new VariantFilterRunner(reader, null, filters, vr);
                    break;
                case ANNOT:
                    vrAux = new VariantAnnotRunner(reader, null, annots, vr);
                    break;
                case EFFECT:
                    vrAux = new VariantEffectRunner(reader, new VariantEffectSqliteDataWriter(outputFile), vr);
                    break;
                case STATS:
                    vrAux = new VariantStatsRunner(reader, new VariantStatsSqliteDataWriter(outputFile), pedFile, vr);
                    break;
                case INDEX:
                    vrAux = new VariantIndexRunner(reader, new VariantIndexSqliteDataWriter(outputFile), vr);
                    break;
            }
            vr = vrAux;
        }

        System.out.println("START");
        vr.run();
        System.out.println("END");


//        switch (command) {
//            case "index":
//                System.out.println("===== INDEX =====");
////                Runtime r = Runtime.getRuntime();
////                Process p;
////
////                String indexDir = commandLine.getOptionValue("outdir") + "/index";
////                File indexFileDir = new File(indexDir);
////                if (!indexFileDir.exists()) {
////                    indexFileDir.mkdir();
////                }
////
////                String cmd = "python bin/indexerManager.py -t vcf -i " + commandLine.getOptionValue("vcf-file") + " --outdir " + indexDir;
////
////                p = r.exec(cmd);
////                p.waitFor();
//
//                outputFile = "index.db";
//                if (commandLine.hasOption("output-file")) {
//                    outputFile = commandLine.getOptionValue("output-file");
//                }
//
//                VariantDataReader dr = new VariantVcfDataReader(commandLine.getOptionValue("vcf-file"));
//                VariantDataWriter f = new VariantVcfDataWriter(commandLine.getOptionValue("outdir") + "/" + outputFile + ".out");
//
//                List<VcfFilter> filterList = new ArrayList<>();
//                List<VcfAnnotator> annots = new ArrayList<>();
//
//                filterList.add(new VcfRegionFilter("1", 0, 1000000));
//
//                annots.add(new VcfTestAnnotator("hola"));
//                annots.add(new VcfTestAnnotator("adios"));
//
//                VariantRunner vfilter = new VariantFilterRunner(dr, f, filterList);
//                VariantRunner vannot = new VariantAnnotRunner(dr, null, annots, vfilter);
//                VariantRunner veffect = new VariantEffectRunner(dr, new VariantEffectSqliteDataWriter(commandLine.getOptionValue("outdir") + "/" + outputFile), vannot);
//                VariantRunner vstatsrunner = new VariantStatsRunner(dr, new VariantStatsSqliteDataWriter(commandLine.getOptionValue("outdir") + "/" + outputFile), commandLine.getOptionValue("ped-file"), veffect);
//                VariantRunner vrunner = new VariantIndexRunner(dr, new VariantIndexSqliteDataWriter(commandLine.getOptionValue("outdir") + "/" + outputFile), vstatsrunner);
//
//                vrunner.run();
//
//                break;
//
//            case "stats":
//                System.out.println("===== STATS =====");
//
//                outputFile = "stats.db";
//
//                if (commandLine.hasOption("output-file")) {
//                    outputFile = commandLine.getOptionValue("output-file");
//                }
//
////                vr = new VariantStatsRunner(commandLine.getOptionValue("vcf-file"), commandLine.getOptionValue("outdir") + "/" + outputFile, commandLine.getOptionValue("ped-file"));
////
////                if (commandLine.hasOption("out-file")) {
////                    vr.writer(new VariantStatsFileDataWriter(commandLine.getOptionValue("outdir")));
////
////                }
////
////                vr.run();
//                break;
//
//            case "filter":
//                System.out.println("===== FILTER =====");
//
//                outputFile = "filter.vcf";
//
//                if (commandLine.hasOption("output-file")) {
//                    outputFile = commandLine.getOptionValue("output-file");
//                }
//
////                List<VcfFilter> filterList = new ArrayList<>();
//////                filterList.add(new VcfSnpFilter());
////                filterList.add(new VcfRegionFilter("1", 0, 1000000000));
////                vf = new VariantFilterRunner(new VariantVcfDataReader(commandLine.getOptionValue("vcf-file")), new VariantVcfDataWriter(commandLine.getOptionValue("outdir") + "/" + outputFile));
////
////                vf.parallel(numThreads);
////                vf.filters(filterList);
////                vf.run();
//
//
//                break;
//
//            case "test":
//                System.out.println("===== TEST =====");
//                List<VcfAnnotator> test = new ArrayList<>();
////                test.add(new VcfTestAnnotator());
////                test.add(new VcfConsequenceTypeAnnotator());
////                var = new VariantAnnotRunner(commandLine.getOptionValue("vcf-file"), commandLine.getOptionValue("outdir") + "/" + "file_annot.vcf");
////                var.annotations(test);
////                var.parallel(numThreads);
////                var.run();
//
//
//                break;
//
//            case "annot":
//                System.out.println("===== ANNOT =====");
//
////
////                outputFile = "annot.vcf";
////
////                if (commandLine.hasOption("output-file")) {
////                    outputFile = commandLine.getOptionValue("output-file");
////                }
////
////                List<VcfAnnotator> listAnnots = new ArrayList<>();
////                VcfAnnotator control = null;
////                String infoPrefix = commandLine.hasOption("control-prefix") ? commandLine.getOptionValue("control-prefix") : "CONTROL";
////
////                var = new VariantAnnotRunner(commandLine.getOptionValue("vcf-file"), commandLine.getOptionValue("outdir") + "/" + outputFile);
////
////                if (commandLine.hasOption("control-list")) {
////                    HashMap<String, String> controlList = getControlList(commandLine.getOptionValue("control-list"));
////                    control = new VcfControlAnnotator(infoPrefix, controlList);
////
////                } else if (commandLine.hasOption("control")) {
////                    control = new VcfControlAnnotator(infoPrefix, commandLine.getOptionValue("control"));
////
////                }
////
////                listAnnots.add(control);
////                var.annotations(listAnnots);
////                var.parallel(numThreads).run();
////
//
//                break;
//
//            case "server":
//                System.out.println("===== SERVER =====");
//
//                Tomcat tomcat;
//
//                tomcat = new Tomcat();
//                tomcat.setPort(31415);
//
//                Context ctx = tomcat.addContext("/variant/rest", new File(".").getAbsolutePath());
//
//                Tomcat.addServlet(ctx, "hello", new HelloServlet());
//                ctx.addServletMapping("/hello", "hello");
//
//                Tomcat.addServlet(ctx, "getdirs", new GetFoldersServlet());
//                ctx.addServletMapping("/getdirs", "getdirs");
//
//
//                try {
//                    tomcat.start();
//                    tomcat.getServer().await();
//
//                } catch (LifecycleException e) {
//                    e.printStackTrace();
//                }
//
//
//                break;
//
//            default:
//                help.printHelp("variant", options);
//                System.exit(-1);
//        }
    }

    private static HashMap<String, String> getControlList(String filename) {
        String line;
        HashMap<String, String> map = new LinkedHashMap<>();
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
