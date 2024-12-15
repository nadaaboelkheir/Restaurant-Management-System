module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define(
    "OrderItem",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      orderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          key: "id",
        },
      },
      menuItemId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          key: "id",
        },
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: { args: [1], msg: "Quantity must be at least 1" },
        },
      },
      totalPrice: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: { args: [0], msg: "Price must be a positive value" },
        },
      },
    },
    {
      timestamps: true,
    }
  );
  OrderItem.associate = function (models) {
    OrderItem.belongsTo(models.Order, { foreignKey: "orderId", as: "order" });
    OrderItem.belongsTo(models.MenuItem, {
      foreignKey: "menuItemId",
      as: "menuItem",
    });
  };

  return OrderItem;
};
