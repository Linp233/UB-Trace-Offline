public class P0201 {
    public static void main(String[] args) throws Exception {
        int[] a = {2, 5};
        int[] b = a;
        b[0] += a[1];
        System.out.println(a[0]);
    }
}
