public class P0203 {
    public static void main(String[] args) throws Exception {
        java.util.HashMap<String, Integer> map = new java.util.HashMap<>();
        map.put("red", 2);
        map.put("blue", 5);
        int old = map.put("red", map.get("blue") + 1);
        System.out.println(map.get("red") + ":" + old);
    }
}
