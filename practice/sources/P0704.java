public class P0704 {
    static String normalize(String name) {
        String cleaned = name.trim();
        String result = cleaned.toUpperCase(java.util.Locale.ROOT);
        return result;
    }
    public static void main(String[] args) throws Exception {
        String actual = normalize("  Ada ");
        String expected = "ADA";
        boolean passed = actual.equals(expected);
        System.out.println(passed);
    }
}
