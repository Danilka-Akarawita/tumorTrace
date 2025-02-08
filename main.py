from data_preparation import load_data, preprocess_data, preprocess_data_vgg
from model_building import build_xception_model, build_vgg16_model
from training import train_model
from visualization import display_image, display_heatmap, get_img_array, make_gradcam_heatmap
from prediction import predict_image

# Main Execution
if __name__ == "__main__":
    train_data, test_data = load_data('E:/Danilka/MRI/Training', 'E:/Danilka/MRI/Testing')
    train_prep_data, valid_prep_data, test_prep_data = preprocess_data(train_data, test_data, img_size=(255, 255), batch_size=32)

    # Xception Model-transfer learning
    xception_model = build_xception_model(img_shape=(255, 255, 3))
    train_model(xception_model, train_prep_data, valid_prep_data)

    # VGG16 Model
    train_prep_data_vgg, valid_prep_data_vgg = preprocess_data_vgg(train_data, valid_prep_data, img_size=(224, 224), batch_size=32)
    vgg_model = build_vgg16_model(img_shape=(224, 224, 3))
    train_model(vgg_model, train_prep_data_vgg, valid_prep_data_vgg)

    img_path = "E:/Danilka/MRI/Training/glioma/Tr-glTr_0002.jpg"
    display_image(img_path)

    img_array = get_img_array(img_path, (224, 224))
    heatmap = make_gradcam_heatmap(img_array, vgg_model, 'block5_conv3')
    display_heatmap(img_path, heatmap)

    predicted_class_index, predictions = predict_image(vgg_model, img_array)
    print(f"Predicted Class Index: {predicted_class_index}")
    print(f"Class Probabilities: {predictions}")