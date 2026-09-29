public class P0301 {
    static class Box {
        int value;
        Box(int x) {   this.value = x;  }
        int add(int delta) {
            this.value += delta;
            return this.value;
        }
    }
    public static void main(String[] args) throws Exception {
        Box b = new Box(3);
        int result = b.add(2);
        System.out.println(result);
    }
}
