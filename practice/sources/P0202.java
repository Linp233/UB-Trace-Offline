public class P0202 {
    public static void main(String[] args) throws Exception {
        java.util.ArrayList<Integer> list = new java.util.ArrayList<>();
        list.add(3);
        list.add(8);
        int old = list.set(0, list.get(1) - 2);
        System.out.println(list);
        System.out.println(old);
    }
}
