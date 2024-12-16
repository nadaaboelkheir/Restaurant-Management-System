module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    "Order",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          key: "id",
        },
      },
      status: {
        type: DataTypes.ENUM("pending", "complete", "expired"),
        defaultValue: "pending",
        allowNull: false,
      },
      total: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      expiredAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      completeAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      timestamps: true,

      hooks: {
        beforeCreate: async (order) => {
          order.expiredAt = new Date(Date.now() + 4 * 60 * 60 * 1000); 
        },
      },
    }
  );
  Order.associate = function (models) {
    Order.belongsTo(models.User, { foreignKey: "userId", as: "user" });
    Order.hasMany(models.OrderItem, {
      foreignKey: "orderId",
      as: "orderItems",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };
  return Order;
};
