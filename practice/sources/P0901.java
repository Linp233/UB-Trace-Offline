public class P0901 {
    public static void main(String[] args) throws Exception {
        java.util.ArrayList<java.util.ArrayList<Integer>> graph = new java.util.ArrayList<>();
        java.util.ArrayList<Integer> a = new java.util.ArrayList<>();
        java.util.ArrayList<Integer> b = new java.util.ArrayList<>();
        java.util.ArrayList<Integer> c = new java.util.ArrayList<>();
        a.add(1);
        a.add(2);
        b.add(2);
        graph.add(a);
        graph.add(b);
        graph.add(c);
        int degree = graph.get(0).size();
        int target = graph.get(0).get(1);
        System.out.println(degree + ":" + target);
    }
}
