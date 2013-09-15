package org.opencb.variant.lib.io;


import org.opencb.variant.lib.core.formats.VariantEffect;
import org.opencb.variant.lib.core.formats.VariantInfo;
import org.opencb.variant.lib.core.formats.VcfVariantStat;

import java.sql.*;
import java.sql.ResultSet;
import java.util.*;

/**
 * Created with IntelliJ IDEA.
 * User: aleman
 * Date: 9/8/13
 * Time: 9:29 AM
 * To change this template use File | Settings | File Templates.
 */
public class WSSqliteManager {

    private static final String pathDB = "/opt/data/data/";

    public static List<VariantInfo> getRecords(HashMap<String, String> options) {

        Connection con;
        Statement stmt;
        List<VariantInfo> list = new ArrayList<>(100);

        String dbName = options.get("db_name");

        try {
            Class.forName("org.sqlite.JDBC");
            con = DriverManager.getConnection("jdbc:sqlite:" + pathDB + dbName);

            List<String> whereClauses = new ArrayList<>(10);

            if (options.containsKey("chrpos") && !options.get("chrpos").equals("")) {
                String chrPos = options.get("chrpos").split(":")[0];
                int start = Integer.parseInt(options.get("chrpos").split(":")[1].split("-")[0]);
                int end = Integer.parseInt(options.get("chrpos").split(":")[1].split("-")[1]);

                whereClauses.add("variant_stats.chromosome='" + chrPos + "'");
                whereClauses.add("variant_stats.position>=" + start);
                whereClauses.add("variant_stats.position<=" + end);

            }


            if (options.containsKey("mend_error") && !options.get("mend_error").equals("")) {
                String val = options.get("mend_error");
                String opt = options.get("option_mend_error");
                whereClauses.add("variant_stats.mendel_err " + opt + " " + val);

            }

            if (options.containsKey("is_indel") && options.get("is_indel").equalsIgnoreCase("on")) {
                whereClauses.add("variant_stats.is_indel=1");
            }

            if (options.containsKey("maf") && !options.get("maf").equals("")) {
                String val = options.get("maf");
                String opt = options.get("option_maf");
                whereClauses.add("variant_stats.maf " + opt + " " + val);

            }

            if (options.containsKey("mgf") && !options.get("mgf").equals("")) {
                String val = options.get("mgf");
                String opt = options.get("option_mgf");
                whereClauses.add("variant_stats.mgf " + opt + " " + val);

            }

            if (options.containsKey("miss_allele") && !options.get("miss_allele").equals("")) {
                String val = options.get("miss_allele");
                String opt = options.get("option_miss_allele");
                whereClauses.add("variant_stats.miss_allele " + opt + " " + val);
            }
            if (options.containsKey("miss_gt") && !options.get("miss_gt").equals("")) {
                String val = options.get("miss_gt");
                String opt = options.get("option_miss_gt");
                whereClauses.add("variant_stats.miss_gt " + opt + " " + val);

            }
            if (options.containsKey("cases_percent_dominant") && !options.get("cases_percent_dominant").equals("")) {
                String val = options.get("cases_percent_dominant");
                String opt = options.get("option_cases_dom");
                whereClauses.add("variant_stats.cases_percent_dominant " + opt + " " + val);
            }

            if (options.containsKey("controls_percent_dominant") && !options.get("controls_percent_dominant").equals("")) {
                String val = options.get("controls_percent_dominant");
                String opt = options.get("option_controls_dom");
                whereClauses.add("variant_stats.controls_percent_dominant " + opt + " " + val);
            }

            if (options.containsKey("cases_percent_recessive") && !options.get("cases_percent_recessive").equals("")) {
                String val = options.get("cases_percent_recessive");
                String opt = options.get("option_cases_rec");
                whereClauses.add("variant_stats.cases_percent_recessive " + opt + " " + val);
            }

            if (options.containsKey("controls_percent_recessive") && !options.get("controls_percent_recessive").equals("")) {
                String val = options.get("controls_percent_recessive");
                String opt = options.get("option_controls_rec");
                whereClauses.add("variant_stats.controls_percent_recessive " + opt + " " + val);
            }

            String sql = "SELECT distinct variant.id_variant, sample_info.sample_name, sample_info.allele_1, sample_info.allele_2, variant_stats.chromosome , " +
                    "variant_stats.position , variant_stats.allele_ref , variant_stats.allele_alt , variant_stats.id , variant_stats.maf , variant_stats.mgf ," +
                    "variant_stats.allele_maf , variant_stats.genotype_maf , variant_stats.miss_allele , variant_stats.miss_gt , variant_stats.mendel_err , " +
                    "variant_stats.is_indel , variant_stats.cases_percent_dominant , variant_stats.controls_percent_dominant , variant_stats.cases_percent_recessive , variant_stats.controls_percent_recessive " +
                    " FROM variant_stats " +
                    "inner join variant on variant_stats.chromosome=variant.chromosome AND variant_stats.position=variant.position AND variant_stats.allele_ref=variant.ref AND variant_stats.allele_alt=variant.alt " +
                    "inner join sample_info on variant.id_variant=sample_info.id_variant";


            if (whereClauses.size() > 0) {
                StringBuilder where = new StringBuilder(" where ");

                for (int i = 0; i < whereClauses.size(); i++) {
                    where.append(whereClauses.get(i));
                    if (i < whereClauses.size() - 1) {
                        where.append(" AND ");
                    }
                }

                sql += where.toString() + " ;";
            }

            System.out.println(sql);

            stmt = con.createStatement();
            ResultSet rs = stmt.executeQuery(sql);

            VcfVariantStat vs;
            VariantInfo vi = null;
//            VariantEffect ve;

            String chr = "";
            int pos = 0;
            String ref = "", alt = "";

            while (rs.next()) {

                if (!rs.getString("chromosome").equals(chr) ||
                        rs.getInt("position") != pos ||
                        !rs.getString("allele_ref").equals(ref) ||
                        !rs.getString("allele_alt").equals(alt)) {

                    chr = rs.getString("chromosome");
                    pos = rs.getInt("position");
                    ref = rs.getString("allele_ref");
                    alt = rs.getString("allele_alt");


                    if (vi != null) {
                        list.add(vi);
                    }
                    vi = new VariantInfo(chr, pos, ref, alt);
                    vs = new VcfVariantStat(chr, pos, ref, alt,
                            rs.getDouble("maf"), rs.getDouble("mgf"), rs.getString("allele_maf"), rs.getString("genotype_maf"), rs.getInt("miss_allele"),
                            rs.getInt("miss_gt"), rs.getInt("mendel_err"), rs.getInt("is_indel"), rs.getDouble("cases_percent_dominant"), rs.getDouble("controls_percent_dominant"),
                            rs.getDouble("cases_percent_recessive"), rs.getDouble("controls_percent_recessive"));
                    vs.setId(rs.getString("id"));

                    vi.addStats(vs);
                }

                String sample = rs.getString("sample_name");
                String gt = rs.getInt("allele_1") + "/" + rs.getInt("allele_2");

                vi.addSammpleGenotype(sample, gt);

//                ve = new VariantEffect(rs.getString("chromosome"), rs.getInt("position"), rs.getString("allele_ref"), rs.getString("allele_alt"),
//                        rs.getString("feature_id"), rs.getString("feature_name"), rs.getString("feature_type"), rs.getString("feature_biotype"),
//                        rs.getString("feature_chromosome"), rs.getInt("feature_start"), rs.getInt("feature_end"), rs.getString("feature_strand"),
//                        rs.getString("snp_id"), rs.getString("ancestral"), rs.getString("alternative"), rs.getString("gene_id"), rs.getString("transcript_id"),
//                        rs.getString("gene_name"), rs.getString("consequence_type"), rs.getString("consequence_type_obo"), rs.getString("consequence_type_desc"),
//                        rs.getString("consequence_type_type"), rs.getInt("aa_position"), rs.getString("aminoacid_change"), rs.getString("codon_change"));
                // vi.addEffect(ve);

            }
            if (vi != null) {
                list.add(vi);
            }

            stmt.close();
            con.close();

        } catch (ClassNotFoundException | SQLException e) {
            System.err.println("STATS: " + e.getClass().getName() + ": " + e.getMessage());
        }

        return list;
    }

    public static List<VariantEffect> getEffect(HashMap<String, String> options) {

        Connection con;
        Statement stmt;
        List<VariantEffect> list = new ArrayList<>(100);

        String dbName = options.get("db_name");

        try {
            Class.forName("org.sqlite.JDBC");
            con = DriverManager.getConnection("jdbc:sqlite:" + pathDB + dbName);

//            List<String> whereClauses = new ArrayList<>(10);

            String chr = options.get("chr");
            int pos = Integer.valueOf(options.get("pos"));
            String ref = options.get("ref");
            String alt = options.get("alt");


            String sql = "SELECT * FROM variant_effect WHERE chromosome='" + chr + "' AND position=" + pos + " AND reference_allele='" + ref + "' AND alternative_allele='" + alt + "';";


//            if (whereClauses.size() > 0) {
//                StringBuilder where = new StringBuilder(" where ");
//
//                for (int i = 0; i < whereClauses.size(); i++) {
//                    where.append(whereClauses.get(i));
//                    if (i < whereClauses.size() - 1) {
//                        where.append(" AND ");
//                    }
//                }
//
//                sql += where.toString() + " ;";
//            }

            System.out.println(sql);

            stmt = con.createStatement();
            ResultSet rs = stmt.executeQuery(sql);

            VariantEffect ve;


            while (rs.next()) {
                ve = new VariantEffect(rs.getString("chromosome"), rs.getInt("position"), rs.getString("reference_allele"), rs.getString("alternative_allele"),
                        rs.getString("feature_id"), rs.getString("feature_name"), rs.getString("feature_type"), rs.getString("feature_biotype"),
                        rs.getString("feature_chromosome"), rs.getInt("feature_start"), rs.getInt("feature_end"), rs.getString("feature_strand"),
                        rs.getString("snp_id"), rs.getString("ancestral"), rs.getString("alternative"), rs.getString("gene_id"), rs.getString("transcript_id"),
                        rs.getString("gene_name"), rs.getString("consequence_type"), rs.getString("consequence_type_obo"), rs.getString("consequence_type_desc"),
                        rs.getString("consequence_type_type"), rs.getInt("aa_position"), rs.getString("aminoacid_change"), rs.getString("codon_change"));
                list.add(ve);

            }

            stmt.close();
            con.close();

        } catch (ClassNotFoundException | SQLException e) {
            System.err.println("EFFECT: " + e.getClass().getName() + ": " + e.getMessage());
        }


        return list;
    }

}