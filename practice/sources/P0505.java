public class P0505 {
    static class Base {
        int value;
        Base(int x) {   value = x;  }
        void add(int amount) {   value += amount;  }
    }
    static class Child extends Base {
        Child(int x) { super(x);   }
    }
    public static void main(String[] args) throws Exception {
        Child c = new Child(2);
        Base b = c;
        b.add(3);
        c.add(1);
        System.out.println(c.value);
    }
}
