import FileUploadComponent from './components/uploadFIleModal';

const Home = () => {
  return (

    <div className="h-screen bg-gradient-to-bl from-blue-500 to-gray-100 ">
      {/* <div className="w-full max-w-3xl mx-auto">
        <h1 className="text-center text-3xl font-bold mb-6">STL Model Preview</h1>
        <PreviewComponent fileURL="/cube.stl" />
      </div> */}
      <div className="m-auto text-4xl font-bold text-center">
        <div className="p-4 rounded-2xl">
          <span className="text-white py-3">Print On Demand</span>
        </div>
      </div>
      <div className="flex justify-center items-center min-h-90">
        <FileUploadComponent />
      </div>
    </div>
  );
};

export default Home;
