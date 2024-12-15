module.exports = (sequelize, DataTypes) => {
  const MenuItem = sequelize.define(
    "MenuItem",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: { args: [0], msg: "Price must be a positive value" },
        },
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );
  MenuItem.associate = function (models) {
    MenuItem.hasMany(models.OrderItem, {
      foreignKey: "menuItemId",
      as: "orderItems",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };
  return MenuItem;
};
