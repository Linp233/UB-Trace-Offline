public class P0305 {
    static class Box {
        int value;
        Box() { this(4);  }
        Box(int x) {   this.value = x;  }
    }
    public static void main(String[] args) throws Exception {
        Box b = new Box();
        b.value++;
        System.out.println(b.value);
    }
}
