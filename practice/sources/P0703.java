public class P0703 {
    static boolean near(double actual, double expected, double epsilon) {
        double diff = Math.abs(actual - expected);
        return diff <= epsilon;
    }
    public static void main(String[] args) throws Exception {
        double actual = 0.1 + 0.2;
        boolean exact = actual == 0.3;
        boolean passed = near(actual, 0.3, 1e-9);
        System.out.println(exact + ":" + passed);
    }
}
