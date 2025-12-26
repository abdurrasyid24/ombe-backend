'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('products', [
      // ========== BEVERAGES ==========
      {
        name: 'Creamy Ice Coffee',
        description: 'Creaamy ice cofffee by ombe',
        price: 5.8,
        oldPrice: 6.0,
        image: 'https://res.cloudinary.com/drag95ahy/image/upload/v1766413090/cup_2_df77wx.png',
        imagePublicId: 'coffee_samples/creamy_ice_coffee',
        categoryId: 1,
        rating: 4.5,
        points: 45,
        stock: 100,
        isActive: true,
        isFeatured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }, 
      {
        name: 'Indonesian Tea',
        description: 'Traditional Indonesian tea with a rich and aromatic flavor',
        price: 2.5,
        oldPrice: 6.0,
        image: 'https://res.cloudinary.com/drag95ahy/image/upload/v1766413089/cup_1_buskg6.png',
        imagePublicId: 'coffee_samples/indonesian_tea',
        categoryId: 1,
        rating: 4.5,
        points: 45,
        stock: 100,
        isActive: true,
        isFeatured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Iced Americano',
        description: 'Espresso shots topped with cold water produce a light layer of crema, then served over ice',
        price: 3.5,
        oldPrice: 5.0,
        image: 'https://res.cloudinary.com/drag95ahy/image/upload/v1766414732/Gemini_Generated_Image_6ghqbp6ghqbp6ghq-Photoroom_h6qdro.png',
        imagePublicId: 'coffee_samples/iced_americano',
        categoryId: 1,
        rating: 4.3,
        points: 40,
        stock: 100,
        isActive: true,
        isFeatured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Cappuccino',
        description: 'Dark, rich espresso lies in wait under a smoothed and stretched layer of thick milk foam',
        price: 4.0,
        oldPrice: 5.5,
        image: 'https://res.cloudinary.com/drag95ahy/image/upload/v1766414761/Gemini_Generated_Image_twgrixtwgrixtwgr-Photoroom_haggtw.png',
        imagePublicId: 'coffee_samples/cappuccino',
        categoryId: 1,
        rating: 4.7,
        points: 50,
        stock: 100,
        isActive: true,
        isFeatured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Caramel Macchiato',
        description: 'Espresso combined with vanilla-flavored syrup, milk and caramel drizzle for a sweet finish',
        price: 4.5,
        oldPrice: 6.0,
        image: 'https://res.cloudinary.com/drag95ahy/image/upload/v1766412784/Gemini_Generated_Image_mwdh1cmwdh1cmwdh_yvpoiz.png',
        imagePublicId: 'coffee_samples/caramel_macchiato',
        categoryId: 1,
        rating: 4.5,
        points: 45,
        stock: 100,
        isActive: true,
        isFeatured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // ========== FOODS ==========
      {
        name: 'Butter Croissant',
        description: 'Classic French-style butter croissant with flaky layers and rich buttery taste',
        price: 3.0,
        oldPrice: 4.0,
        image: 'https://res.cloudinary.com/drag95ahy/image/upload/v1766414837/Gemini_Generated_Image_dzka0sdzka0sdzka_vu5dmo.png',
        imagePublicId: 'food_samples/croissant',
        categoryId: 2,
        rating: 4.2,
        points: 30,
        stock: 50,
        isActive: true,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // ========== DESSERTS ==========
      {
        name: 'Chocolate Cake',
        description: 'Rich triple-layer chocolate cake with creamy chocolate frosting',
        price: 5.0,
        oldPrice: 6.5,
        image: 'https://res.cloudinary.com/drag95ahy/image/upload/v1766414836/Gemini_Generated_Image_eji4vreji4vreji4_clfez9.png',
        imagePublicId: 'dessert_samples/chocolate_cake',
        categoryId: 3,
        rating: 4.8,
        points: 55,
        stock: 30,
        isActive: true,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Classic Cheesecake',
        description: 'New York style cheesecake with graham cracker crust',
        price: 5.5,
        oldPrice: 7.0,
        image: 'https://res.cloudinary.com/drag95ahy/image/upload/v1766414835/Gemini_Generated_Image_3l4lg93l4lg93l4l_giql6i.png',
        imagePublicId: 'dessert_samples/cheesecake',
        categoryId: 3,
        rating: 4.9,
        points: 60,
        stock: 30,
        isActive: true,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('products', null, {});
  }
};