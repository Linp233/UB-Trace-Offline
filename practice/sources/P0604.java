public class P0604 {
    static class Near implements java.util.Comparator<Integer> {
        int pivot;
        Near(int pivot) {   this.pivot = pivot;  }
        public int compare(Integer a, Integer b) {
            int da = Math.abs(a - pivot);
            int db = Math.abs(b - pivot);
            return Integer.compare(da, db);
        }
    }
    public static void main(String[] args) throws Exception {
        java.util.Comparator<Integer> cmp = new Near(5);
        int first = cmp.compare(2, 7);
        int second = cmp.compare(6, 3);
        System.out.println(first + ":" + second);
    }
}
