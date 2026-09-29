public class P0503 {
    static class Base {
        int value;
        Base(int seed) {   value = seed;  }
    }
    static class Child extends Base {
        Child() { this(5);  }
        Child(int start) { super(start);   value++;  }
    }
    public static void main(String[] args) throws Exception {
        Child c = new Child();
        System.out.println(c.value);
    }
}
