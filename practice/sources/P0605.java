public class P0605 {
    static class Desc implements java.util.Comparator<Integer> {
        Desc() {  }
        public int compare(Integer a, Integer b) {    return b - a; }
    }
    public static void main(String[] args) throws Exception {
        java.util.Comparator<Integer> cmp = new Desc();
        int[] data = {2, 7};
        int order = cmp.compare(data[0], data[1]);
        if (order > 0) {
            int temp = data[0];
            data[0] = data[1];
            data[1] = temp;
        }
        System.out.println(java.util.Arrays.toString(data));
    }
}
