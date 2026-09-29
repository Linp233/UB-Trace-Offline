import java.util.IdentityHashMap;
import java.util.Base64;
import java.nio.charset.StandardCharsets;

// Only injected into temporary verification builds, never into question sources.
class TraceProbe {
    private static final IdentityHashMap<Object, String> refs = new IdentityHashMap<>();
    private static String quote(String text) {
        return "\"" + text.replace("\\", "\\\\").replace("\"", "\\\"")
            .replace("\n", "\\n").replace("\r", "\\r").replace("\t", "\\t") + "\"";
    }
    static void check(String key, Object value) {
        String text;
        if (value == null) text = "null";
        else if (value instanceof String) text = quote((String)value);
        else if (value instanceof Character) text = "'" + value + "'";
        else if (value instanceof Number || value instanceof Boolean) text = value.toString();
        else text = refs.computeIfAbsent(value, ignored -> String.format("0x%x", 0x100 + refs.size()));
        String payload = Base64.getEncoder().encodeToString(text.getBytes(StandardCharsets.UTF_8));
        System.err.println("TRACE\t" + key + "\t" + payload);
    }
    static boolean condition(String key, Object value, boolean result) {
        check(key, value);
        return result;
    }
}
